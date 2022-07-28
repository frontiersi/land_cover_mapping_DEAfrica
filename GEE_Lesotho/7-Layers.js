var legend_utils = require('users/ocsgeospatial/Lesotho:8-LegendUtils.js');

// Example to add a layer to dashboard
// Land Cover 2017 Baseline produced from Sentinel-2
exports.loadLayers = function(inputs, plots){
  
  // Define inputs to the layers to load. 
  // The new layers do not necessarily need to use prior inputs, but they can if need be.
  var classification_baseline = inputs['classification_baseline'];
  var classification_palette = inputs['classification_palette'];
  var classification_palette_red = inputs['classification_palette_red'];
  var baseline_year = inputs['baseline_year'];
  var lc_mask_baseline = inputs['lc_mask_baseline'];
  var classes = inputs['classes'];
  var classification_names = inputs['classification_names'];
  var country = inputs['country'];
  var adm1_name = inputs['adm1_name'];
  var counties = inputs['counties'];
  var catchments_fc_baseline = inputs['catchments_fc_baseline'];
  var catchments_fc_baseline_all = inputs['catchments_fc_baseline_all'];

  // Define the background layer (country or admin area boundary).
  var aoi_layer = ui.Map.Layer(country.geometry(), {}, adm1_name + ' Boundaries');
  
  // Define the main layer, in this case land cover baseline 2017
  var landCoverBaseline_layer = ui.Map.Layer(classification_baseline.updateMask(lc_mask_baseline).clip(country.geometry()),
                                             {palette: classification_palette, min: 1, max: 15},
                                             'Land Cover Baseline - '+baseline_year);
  
  // Define a legend for the layer, which in this case is the color palette for the land cover data
  var landCover_legend = legend_utils.makeLegend('Land Cover Legend', classification_palette_red, classification_names, 9);

  // Add a pie chart to summarize the surface areas for each land cover class
  var landCoverBaseline_pieChart = ui.Chart.feature.byFeature({
      features: catchments_fc_baseline,
      xProperty: 'lc_type',
      yProperties: ['area']
    })
    .setChartType('PieChart')
    .setOptions({title: 'Land Cover Baseline class distribution (in hectares)',
                    colors: classification_palette_red,
                    sliceVisibilityThreshold: 0 // Don't group small slices.
                  });
  
  // Same as the previous plot, except this is done for all admin areas and presented in a bar plot instead of pie chart.
  var landCoverBaseline_barChart = ui.Chart.feature.groups({
      features: catchments_fc_baseline_all,
      xProperty: 'catchment',
      yProperty: 'area',
      seriesProperty: 'lc_type'
    })
    .setChartType('ColumnChart')
    .setSeriesNames(classification_names)
    .setOptions({
      title: 'Land Cover Baseline class distribution per catchment',
      width: 200,
      height: 400,
      textPosition: "in",
      //orientation: "vertical",
      hAxis: {title: 'catchment ID', textStyle: {fontSize: 13}},
      vAxis: {title: 'Area (hectares)'},
      colors: classification_palette_red,
      sliceVisibilityThreshold: 0, // Don't group small slices.
      isStacked: 'absolute'
    });
  
  // Add a caption and a source for the layer, in order to give more understanding to the user.
  var landCoverBaseline_source = ui.Label('FAO. Lesotho Land Cover Atlas v2.0. 2022.');
  var landCoverBaseline_caption = ui.Label('Lesotho Land Cover 2017 produced by FAO.');
  
  // Load the defined variables to a dictionary payload to send back to the main script.
  plots['Land Cover Baseline - '+baseline_year] = {'layers': [aoi_layer, landCoverBaseline_layer], // Mandatory
                                                    'legends': [landCover_legend], // Optional
                                                    'plots': [landCoverBaseline_pieChart, landCoverBaseline_barChart], // Optional
                                                    'sources': [landCoverBaseline_source], // Optional
                                                    'captions': [landCoverBaseline_caption] // Optional
                                                    };
  
  /************************/
  /*Add any new layer here*/
  /************************/
  
  return plots;
};
