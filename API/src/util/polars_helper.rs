use polars::datatypes::DataType;
use polars::prelude::DataFrame;


pub fn convert_rows_to_f64(df: &mut DataFrame)  {
    let cols = df.get_column_names();
    for i in 0..cols.len() {
        let s = df.select_at_idx(i).expect("Unable to select column");
        // convert all columns to float32
        let s = s.cast(&DataType::Float64).expect("Unable to cast column");
        // replace column with new column
        df.replace_at_idx(i, s).expect("Unable to replace column");
    }
}


pub fn drop_columns(df: &mut DataFrame, model_name: &str)  {

    let mut columns_to_drop_all = vec![
        "TEAM_NAME",
        "TEAM_ID",
        "GP",
        "GP_RANK",
        "CFID",
        "MIN",
        "CFPARAMS",
    ];

    if model_name == "v2" {
        columns_to_drop_all.append(&mut vec![
            "W",
            "L",
            "PLUS_MINUS",
            "W_RANK",
            "L_RANK",
            "MIN_RANK",
            "PLUS_MINUS_RANK",
      ]);
    }

    for column in columns_to_drop_all {
        let _ = df.drop_in_place(column);
        let _ = df.drop_in_place(&format!("{column}_duplicated_0"));
    }
}