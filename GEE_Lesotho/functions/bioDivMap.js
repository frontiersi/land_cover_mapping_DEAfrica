// ****************************************************************************************************************** //
// ***************************** Computing the different steps of the BioDivMap Methodology ************************* //
// ****************************************************************************************************************** //

// Computes the Soil Erodibility Factor K from: Renard, K., Foster, G., Weesies, G., McCool, D. & Yoder, D.
// Predicting Soil Erosion by Water: a Guide to Conservation Planning with
// the Revised Universal Soil Loss Equation (RUSLE) (USDA-ARS, Washington, 1997).
exports.PCA = function(image, geom, options){

    //var bands_wv = options.bands_wv || {1: 490, 2: 560, 3: 665, 4: 705, 5: 740,
    //                                    6: 783, 7: 842, 8: 865, 9: 1610, 10: 2190};
    var sr_band_scale = options.sr_band_scale || 10000;
    var bands = options.bands || ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12'];

    var meanDict = image.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: geom,
        scale: 100,
        maxPixels: 1e13,
        tileScale: 4
    });

    var means = ee.Image.constant(meanDict.values(bands));
    var centered = image.subtract(means);

    var pcImage = _getPrincipalComponents(centered.toArray(), 100, geom, bands);
    return pcImage;
}

exports.plotPCA = function(pca_vals, x, y){
    // Convert NIR and SWIR value lists to an array to be plotted along the y-axis.

    var xValues = pca_vals.aggregate_array(x);
    var yValues = pca_vals.aggregate_array(y);

    yValues = ee.Dictionary.fromLists([x, y], [xValues, yValues]).toArray([x, y]);

    // Define the chart and print it to the console.
    var chart = ui.Chart.array.values({array: yValues, axis: 1, xLabels: xValues})
                    .setSeriesNames([x, y])
                    .setOptions({
                      title: 'Relationship Among Principal Components',
                      colors: ['blue', 'red'],
                      pointSize: 4,
                      dataOpacity: 0.4,
                      hAxis: {
                        'title': x,
                        titleTextStyle: {italic: false, bold: true}
                      },
                      vAxis: {
                        'title': y,
                        titleTextStyle: {italic: false, bold: true}
                      }
                    });
    return chart;
}

exports.spectralSpecies = function(pca, samples, pca_bands, region, options){

  var nb_clusters = options.nb_clusters || 50;
  var partition_size = options.partition_size || 1;
  var window_size = options.window_size || 9;
  var subset_size = options.subset_size || 2000;

  // Instantiate the clusterer and train it.
  var clusterer = ee.Clusterer.wekaKMeans(nb_clusters).train(samples, pca_bands, partition_size, 1);

  // Cluster the input using the trained clusterer.
  var result = pca.select(pca_bands).cluster(clusterer);

  var diversity_indices = ee.ImageCollection.fromImages(
      ee.List.sequence(0, nb_clusters-1).map(function(val){
          var foc_mean = result.eq(ee.Number(val)).focalMean(window_size/2, 'square').rename('abundance');
          // compute mean and covariance in region

          var shannon_term = foc_mean.multiply(foc_mean.log()).multiply(-1).rename('shannon');
          var simpson_term = foc_mean.pow(2).rename('simpson');

          return shannon_term.addBands(simpson_term).addBands(foc_mean);
          //return ee.Feature(null, {'species': val,
          //                         'image': shannon_term.addBands(simpson_term),
          //                         'bc': bray_curtis,
          //                         'bc_subset': bray_curtis_subset})
      })
  );

  var species_col = diversity_indices.sum();

  var species_abundance = diversity_indices.select('abundance').toBands();

  var ordin_subset = species_abundance.sample({
                      //reducer: ee.Reducer.toList(),
                      region: region,
                      scale: 10,
                      numPixels: subset_size,
                      tileScale: 4,
                      //seed: 1
                    });

  var band_names = species_abundance.bandNames();

  var diss_matrix = band_names.map(function(band_name){

    return ordin_subset.aggregate_array(band_name).map(function(i) {
      return ordin_subset.aggregate_array(band_name).map(function(j) {
        return ee.Number(i).subtract(ee.Number(j)).abs().divide(ee.Number(i)).add(ee.Number(j))
      })
    });
  });

  var bc_diss = ee.Array(diss_matrix).reduce({
    reducer: ee.Reducer.sum(),
    axes: [0]
  }).project([1,2]);

  var bc = ordin_subset.map(function(feat){

    return ee.ImageCollection.fromImages(band_names.map(function(i){
      return ee.Image(ee.Number(feat.get(i))).subtract(species_abundance.select([i])).abs()
             .divide(ee.Image(ee.Number(feat.get(i))).add(species_abundance.select([i])))
    })).sum().rename('bc');
  });

  var nn1 = ee.ImageCollection(bc.map(function(img){return ee.Image(img).updateMask(ee.Image(img).gt(0))})).min()//.rename(['min', 'arg']);
  var nn2 = ee.ImageCollection(bc.map(function(img){return ee.Image(img).updateMask(ee.Image(img).gt(nn1))})).min()//.rename(['min', 'arg']);
  var nn3 = ee.ImageCollection(bc.map(function(img){return ee.Image(img).updateMask(ee.Image(img).gt(nn2))})).min()//.rename(['min', 'arg']);

  var w1 = ee.Image(1).divide(nn1.subtract(nn2).abs().add(nn1.subtract(nn3).abs()));
  var w2 = ee.Image(1).divide(nn2.subtract(nn1).abs().add(nn2.subtract(nn3).abs()));
  var w3 = ee.Image(1).divide(nn3.subtract(nn1).abs().add(nn3.subtract(nn2).abs()));

  var iwd = w1.multiply(nn1)
            .add(w2.multiply(nn2))
            .add(w3.multiply(nn3))
            .divide(w1.add(w2).add(w3)).rename('iwd');

  var eigens = bc_diss.eigen();
  var eigenValues = eigens.slice(1, 0, 1).slice(0, 0, 3);
  var eigenVectors = eigens.slice(1, 1).slice(0, 0, 3);
  //var arrayImage = arrays.toArray(1);
  var principalComponents = ee.Image(eigenVectors).matrixMultiply(iwd.toArray().toArray(1));
  var sdImage = eigenValues.sqrt().project([0]);
  sdImage = ee.Image(sdImage.get([0])).rename('sd1')
            .addBands(ee.Image(sdImage.get([1])).rename('sd2'))
            .addBands(ee.Image(sdImage.get([2])).rename('sd3'));

  var pcoaImage = principalComponents.arrayProject([0])
                                     .arrayFlatten([['pcoa1', 'pcoa2', 'pcoa3']])
                                     .divide(sdImage);

  return species_col.addBands(result).addBands(iwd).addBands(pcoaImage);
}

exports.raoQ = function(region, options){

  var subset_size = options.subset_size || 2000;
  var window_size = options.window_size || 4;

  var wrap = function(img){
    // compute mean and covariance in region

    /*
    var mean = foc_mean.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: region,
      scale: 10,
      crs: 'EPSG:4326',
      maxPixels: 1e13,
      tileScale: 4
    }).get('abundance');

    var covariance = foc_mean.reduceRegion({
      reducer: ee.Reducer.covariance(),
      geometry: region,
      scale: 10,
      crs: 'EPSG:4326',
      maxPixels: 1e13,
      tileScale: 4
    }).get('abundance');

    // Mahalanobis distance as alternative to euclidian distance
    var mahalanobis = comm_grid.map(function(i) {
      return comm_grid.map(function(j) {
        var mean_i = ee.Array(ee.Dictionary(lists.get(i)).get('mean'));
        var mean_j = ee.Array(ee.Dictionary(lists.get(j)).get('mean'));
        var sigma_i = ee.Array(ee.Dictionary(lists.get(i)).get('covariance'));
        var sigma_j = ee.Array(ee.Dictionary(lists.get(j)).get('covariance'));
        return mean_i.subtract(mean_j).transpose() // 1x6
            .matrixMultiply(sigma_i.add(sigma_j).divide(2).matrixInverse()) // 6x6
            .matrixMultiply(mean_i.subtract(mean_j))
            .sqrt()
            .get([0, 0]);
      });
    });
    */
    var subsets = img.select(0).neighborhoodToArray(ee.Kernel.square(window_size/2));
    var N = ee.Number(window_size+1).pow(2);

    var rao_q = ee.Image(ee.List.sequence(1, window_size-2).iterate(function(i, img) {
      return ee.Image(img).add(ee.List.sequence(ee.Number(i).add(1), window_size-1).iterate(function(j, img) {
        return ee.Image(img).add(subsets
                                .subtract(subsets.arraySlice(0, ee.Number(i).int(), ee.Number(i).add(1).int())
                                                 .arraySlice(1, ee.Number(j).int(), ee.Number(j).add(1).int())
                                                 .arrayProject([0])
                                                 .arrayFlatten([['community']])
                                         ).abs()
                                .multiply(ee.Image(1).divide(N))
                                );
      }, subsets.subtract(subsets.arraySlice(0, ee.Number(i).int(), ee.Number(i).add(1).int())
                                 .arraySlice(1, 1, 2)
                                 .arrayProject([0])
                                 .arrayFlatten([['community']])
                         ).abs()
                      .multiply(ee.Image(1).divide(N)
                      )));
    }, subsets.subtract(subsets.arraySlice(0, 0, 1)
                               .arraySlice(1, 1, 2)
                               .arrayProject([0])
                               .arrayFlatten([['community']])
                       ).abs()
                       .multiply(ee.Image(1).divide(N))
    ));

    return img.select(0).multiply(100).toByte().entropy(ee.Kernel.square(window_size/2)).rename('shannon')
           .addBands(rao_q.arrayReduce({reducer:ee.Reducer.sum().unweighted(), axes:[0, 1]})
                          .arrayProject([0]).arrayFlatten([['rao']]).divide(2))
           .addBands(img.select(1))
           .copyProperties(img, ['system:time_start']);
  }

  return wrap
};

function _getNewBandNames(prefix, bands){
    var seq = ee.List.sequence(1, bands.length);
    return seq.map(function(b) {
        return ee.String(prefix).cat(ee.Number(b).int());
    });
}

// PCA function
function _getPrincipalComponents(arrays, scale, region, bands){
    //var arrays = centered.toArray();
    var covar = arrays.reduceRegion({
      reducer: ee.Reducer.centeredCovariance(),
      geometry: region,
      scale: scale,
      maxPixels: 1e13,
      tileScale: 4
    });

    var covarArray = ee.Array(covar.get('array'));
    var eigens = covarArray.eigen();
    var eigenValues = eigens.slice(1, 0, 1);
    var eigenVectors = eigens.slice(1, 1);
    var arrayImage = arrays.toArray(1);
    var principalComponents = ee.Image(eigenVectors).matrixMultiply(arrayImage);
    var sdImage = ee.Image(eigenValues.sqrt())
    .arrayProject([0]).arrayFlatten([_getNewBandNames('sd', bands)]);

    return [principalComponents.arrayProject([0]).arrayFlatten([_getNewBandNames('pc', bands)]).divide(sdImage),
            eigenValues.divide(eigenValues.accum(0).get([-1,0])).multiply(100)];
}