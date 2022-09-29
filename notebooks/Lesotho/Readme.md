This folder contains jupyter notebooks replicating FAO's existing workflow in GEE for 2021 land cover mapping across Lesotho. Running the notebooks requires access to DEAfrica sandbox and you many need to change input/output data locations in the scripts. Input datasets required are copied into 'Data' folder except the GoogleBuldings layer which is too large to upload to github. Output data were mostly not uploaded to 'Results' folder to save space, so you need to run the scripts to generate country-wide outputs. To run through the workflow:

1. Extract training features (geomedian bands) using unfiltered training data points by running 'Extract_training_data_GEE_replicate.ipynb'

2. Produce baseline/reference land cover map using the extracted training features by running 'Land_cover_classification_GEE_replicate.ipynb'

3. Extract and filter training points using the baseline/reference land cover map by running 'Filter_training_data_GEE_replicate.ipynb'

4. Evaluate and fit random forest classifier using the filtered training features by running 'Evaluate_fit_classifier_GEE_replicate.ipynb'

5. Produce 2021 land cover map using the filtered training features and fitted classifier by running 'Land_cover_classification_GEE_replicate.ipynb'

6. Reclassification of irrigated croplands by running 'Post_process_reclassify_irrigated_croplands.ipynb'

7. Reclassification of gullies by running 'Post_process_reclassify_gully.ipynb'

8. Implement other post-processings by running 'Post_process_all_others.ipynb'

Note that for comparison these modules are trying to replicate as much as possible the implementation in GEE, which means no improvements or changes were made to some implementations (e.g. cross validation, feature normalisation for clustering) even though they were in a very hard way or not optimal.