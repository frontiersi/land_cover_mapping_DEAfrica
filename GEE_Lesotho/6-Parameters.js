exports.LCParams = function(){
  
  var lc_params_dict = {
    // Add feature collection parameter for training
    'CLASS_NAME' : 'LC_Class_I', // Property name of the feature collection containing the land cover class attribute
    'AGG_INTERVAL': 365/6, // Number of days to use to create the temporal composites. Better to divide number of days in the year (365) by the number of intervals required (6 or 12 advised).
    'COLLECTION': 'COPERNICUS/S2', // Whether to use L1C ("COPERNICUS/S2") or L2A ("COPERNICUS/S2_SR") data. L2A data is available from 2019 onwards.
    'BAND_LIST': ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B11', 'B12', 'NDVI'], // S2 Bands to use as DTW input
    'TD_CLEANUP_YEAR': '2021', // The year for which to clean up the training dataset. I.e. When 2022 becomes fully available, make this "2022".
    'VERSION_NO': '_v3', // Version number of the land cover outputs produced. All exported assets will contain the this extension at the end of their name.
    'ALGO': 'RF', // Algorithm to apply. Alternative is "DTW", but should not be used for Land Cover Classification, as results will be poorer.
  }

  // A dictionary that will be iterated over for multi-year land cover mapping.
  // Comment out the years you do not wish to produce.
  lc_params_dict['LC_YEARS'] =
    {'2017': lc_params_dict['COLLECTION'], 
     '2018': lc_params_dict['COLLECTION'],
     '2019': lc_params_dict['COLLECTION'],
     '2020': lc_params_dict['COLLECTION'],
     '2021': lc_params_dict['COLLECTION'],
     //'2022': lc_params_dict['COLLECTION'] // Once 2022 is available, this line can be enabled.
  };
  
  // Class list
  lc_params_dict['LC_CLASSES'] = 
    {
      'Built-up': 1,
      'Cropland': 2,
      //'Degraded Cropland': 3,
      'Trees': 4,
      //'broadleaf': 5,
      'Water Body': 6,
      'Wetland': 7,
      //'River Bank': 8,
      'Shrubland': 9,
      'Grassland': 10,
      //'Degraded Grassland': 11,
      'Bare Surfaces': 12,
      //'Invasive Shrubland': 13,
      'Irrigated Cropland': 14,
      'Gullies' : 15
    };
  
  // The corresponding color hex keys for the land cover classes
  lc_params_dict['LC_PALETTE'] = 
    [
      '#ff1411', // 1.urban
      '#fff78f', // 2.croplands
      //'#fbd278', // 3. degraded crop
      '#4e8845', // 4. trees
      //'#527300', // 5. broadleaf
      '#005b85', // 6. water
      '#68b6e5', // 7. wetlands
      //'#164fab',  // 8. river banks
      '#c78d36', // 9. shrub
      '#d6e591',  // 10. grass
      //'#d8febc', //11. degraded grass
      '#9ba7a0', // 12. barren
      //'#fffebb', // 13. mine
      '#95dfa5', // 14. Irrigated Cropland
      '#562118' // 15. Gullies
    ];
  
  /*                         
  // Old color palette
  lc_params_dict['LC_PALETTE'] = [
    '#ea3f42', // 1.urban
    '#fbd278', // 2.croplands
    //'#fbd278', // 3. degraded crop
    '#527300', // 4. trees
    //'#527300', // 5. broadleaf
    '#164fab', // 6. water
    '#7db4ff', // 7. wetlands
    //'#164fab',  // 8. river banks
    '#a4e400', // 9. shrub
    '#d8febc',  // 10. grass
    //'#d8febc', //11. degraded grass
    '#fffebb', // 12. barren
    //'#fffebb', // 13. mine
    '#95dfa5', // 14. Irrigated Cropland
    '#a4651d' // 15. Gullies
  ];
  */
  
  return lc_params_dict;
}