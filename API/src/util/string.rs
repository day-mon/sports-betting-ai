use serde_json::Value;

pub fn remove_quotes(value: &Value) -> String {
    let str = value.to_string();
    str.replace('\"', "")
}
