use polars::datatypes::DataType;
use polars::prelude::DataFrame;


pub fn convert_rows_to_f64(df: &mut DataFrame) -> &mut DataFrame {
    let cols = df.get_column_names();
    for i in 0..cols.len() {
        let s = df.select_at_idx(i).expect("Unable to select column");
        // convert all columns to float32
        let s = s.cast(&DataType::Float64).expect("Unable to cast column");
        // replace column with new column
        df.replace_at_idx(i, s).expect("Unable to replace column");
    }
    df
}


pub fn drop_columns(df: DataFrame) -> DataFrame {
    df.drop("TEAM_NAME")
        .expect("Unable to drop column TEAM_NAME")
        .drop("TEAM_ID")
        .expect("Unable to drop column TEAM_ID")
        .drop("MIN")
        .expect("Unable to drop column MIN")
        .drop("GP")
        .expect("Unable to drop column GP")
        .drop("GP_RANK")
        .expect("Unable to drop column GP_RANK")
        .drop("CFID")
        .expect("Unable to drop column CFID")
        .drop("CFPARAMS")
        .expect("Unable to drop column CFPARAMS")
        .drop("MIN_duplicated_0")
        .expect("Unable to drop column MIN_duplicated_0")
        .drop("TEAM_NAME_duplicated_0")
        .expect("Unable to drop column TEAM_NAME_duplicated_0")
        .drop("TEAM_ID_duplicated_0")
        .expect("Unable to drop column TEAM_ID_duplicated_0")
        .drop("GP_duplicated_0")
        .expect("Unable to drop column GP_duplicated_0")
        .drop("GP_RANK_duplicated_0")
        .expect("Unable to drop column GP_RANK_duplicated_0")
        .drop("CFID_duplicated_0")
        .expect("Unable to drop column CFID_duplicated_0")
        .drop("CFPARAMS_duplicated_0")
        .expect("Unable to drop column CFPARAMS_duplicated_0")
}