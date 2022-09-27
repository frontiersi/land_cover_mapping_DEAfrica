This folder contains jupyter notebooks replicating FAO's existing land cover mapping workflow for Lesotho in GEE. Running the notebooks requires access to DEAfrica sandbox. To run through the workflow:

1. Extract training features using unfiltered training data by running 'Extract_training_data_GEE_replicate.ipynb'

2. Produce baseline/reference land cover map using the extracted training features by running 'Land_cover_classification_GEE_replicate.ipynb'

3. Extract and filter training features using the baseline/reference map by running 'Filter_training_data_GEE_replicate.ipynb'

4. Evaluate and fit random forest classifier using the filtered training features by running 'Evaluate_fit_classifier_GEE_replicate.ipynb'

5. Produce land cover map using the filtered training features by running 'Land_cover_classification_GEE_replicate.ipynb'

6. Reclassification of irrigated croplands by running 'Post_process_reclassify_irrigated_croplands.ipynb'

7. Reclassification of gullies by running 'Post_process_reclassify_gully.ipynb'

8. Morphological processing, rule-based reclassification using information from external layers by running 'Post_process_all_others.ipynb'

Note that for comparison these modules are trying to replicate as much as possible the implementation in GEE, which means no improvements or changes were made to some implementations even though they are in a very hard way or not optimal (e.g. cross validation, simple scaling before clustering).