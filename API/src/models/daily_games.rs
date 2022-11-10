use serde_derive::Deserialize;
use serde_derive::Serialize;
use serde_json::Value;


#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DailyGames {
    pub gs: Gs,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Gs {
    pub mid: Value,
    pub gdte: Value,
    pub next: Value,
    pub g: Vec<G>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct G {
    pub gid: Value,
    pub gcode: Value,
    pub p: Option<Value>,
    pub st: Value,
    pub stt: Value,
    pub cl: Option<Value>,
    pub seq: Option<Value>,
    pub lm: Lm,
    pub v: V,
    pub h: H,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Lm {
    pub gdte: Option<Value>,
    pub gres: Value,
    pub seri: Value,
    pub gid: Value,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct V {
    pub ta: Value,
    pub q1: Value,
    pub s: Value,
    pub q2: Value,
    pub q3: Value,
    pub q4: Value,
    pub ot1: Value,
    pub ot2: Value,
    pub ot3: Value,
    pub ot4: Value,
    pub ot5: Value,
    pub ot6: Value,
    pub ot7: Value,
    pub ot8: Value,
    pub ot9: Value,
    pub ot10: Value,
    pub tn: Value,
    pub tc: Value,
    pub tid: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct H {
    pub ta: Value,
    pub q1: Value,
    pub s: Value,
    pub q2: Value,
    pub q3: Value,
    pub q4: Value,
    pub ot1: Value,
    pub ot2: Value,
    pub ot3: Value,
    pub ot4: Value,
    pub ot5: Value,
    pub ot6: Value,
    pub ot7: Value,
    pub ot8: Value,
    pub ot9: Value,
    pub ot10: Value,
    pub tn: Value,
    pub tc: Value,
    pub tid: i64,
}


pub struct Match {
    pub home_team_id: i64,
    pub away_team_id : i64
}
