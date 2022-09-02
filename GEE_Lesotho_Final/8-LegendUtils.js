exports.makeLegend = function(title, palette, class_names, class_length){
  // Create a legend for the different crop types
  // set position of panel
  var legend = ui.Panel({
    style: {
      position: 'bottom-left',
      padding: '12px 15px'
    }
  });

  // Create legend title
  var legendTitle = ui.Label({
    value: title,
    style: {
      fontWeight: 'bold',
      fontSize: '18px',
      margin: '0 0 4px 0',
      padding: '0'
      }
  });

  // Add the title to the panel
  legend.add(legendTitle);

  // Creates and styles 1 row of the legend.
  var makeRow = function(color, name) {
        // Create the label that is actually the colored box.
        var colorBox = ui.Label({
          style: {
            backgroundColor: color,
            // Use padding to give the box height and width.
            padding: '8px',
            fontSize: '12px',
            margin: '0 0 4px 0'
          }
        });

        // Create the label filled with the description text.
        var description = ui.Label({
          value: name,
          style: {margin: '0 0 4px 6px'}
        });

        // return the panel
        return ui.Panel({
          widgets: [colorBox, description],
          layout: ui.Panel.Layout.Flow('horizontal')
        });
  };

  // Add color and and names
  for (var i = 0; i <= class_length; i++) {
    legend.add(makeRow(palette[i], class_names[i]));
    }

  return legend
}

// Function to populate the color palette legends for the app layers
exports.populateLegend = function(legend_name, viz_params, add_char_min, add_char_max, options){

    // Create a legend for the different crop types
    // set position of panel
    var legend = ui.Panel({
      style: {
        position: 'bottom-left',
        padding: '12px 15px'
      }
    });

    // Create legend title
    var legend_title = ui.Label({
      value: legend_name,
      style: {
      fontWeight: 'bold',
      fontSize: '18px',
      margin: '0 0 0 0',
      padding: '0',
      //width: '115px'
      }
      });

    // Add the title to the panel
    legend.add(legend_title);

    // create the legend image
    var lon = ee.Image.pixelLonLat().select('latitude');
    var gradient = lon.multiply(ee.Number(viz_params.max).subtract(viz_params.min).divide(100)).add(viz_params.min);
    var legend_image = options.legend_image || gradient.visualize(viz_params);

    // create text on top of legend
    var legend_panel_max = ui.Panel({
      widgets: [
      ui.Label(viz_params['max'] + add_char_max)
      ],
      });

    legend.add(legend_panel_max);

    // create thumbnail from the image
    var thumbnail = ui.Thumbnail({
      image: legend_image ,
      params: {bbox: '0,0,10,100', dimensions:'10x25'},
      style: {padding: '1px', position: 'bottom-center', fontSize: '18px'}
      });

    // add the thumbnail to the legend
    legend.add(thumbnail);

    // create text on top of legend
    var legend_panel_min = ui.Panel({
      widgets: [
      ui.Label(viz_params['min'] + add_char_min)
      ],
      });

    legend.add(legend_panel_min);

    return legend
};

// Creates and styles 1 row of the legend.
exports.makeRow = function(color, name) {
      // Create the label that is actually the colored box.
      var colorBox = ui.Label({
        style: {
          backgroundColor: color,
          // Use padding to give the box height and width.
          padding: '8px',
          margin: '0 0 4px 0'
        }
      });

      // Create the label filled with the description text.
      var description = ui.Label({
        value: name,
        style: {margin: '0 0 4px 6px'}
      });

      // return the panel
      return ui.Panel({
        widgets: [colorBox, description],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
};