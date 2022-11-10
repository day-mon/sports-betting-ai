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
    pub mid: i64,
    pub gdte: String,
    pub next: String,
    pub g: Vec<G>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct G {
    pub gid: String,
    pub gcode: String,
    pub p: i64,
    pub st: i64,
    pub stt: String,
    pub cl: String,
    pub seq: i64,
    pub lm: Lm,
    pub v: V,
    pub h: H,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Lm {
    pub gdte: String,
    pub gres: String,
    pub seri: String,
    pub gid: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct V {
    pub ta: String,
    pub q1: i64,
    pub s: i64,
    pub q2: i64,
    pub q3: i64,
    pub q4: i64,
    pub ot1: i64,
    pub ot2: i64,
    pub ot3: i64,
    pub ot4: i64,
    pub ot5: i64,
    pub ot6: i64,
    pub ot7: i64,
    pub ot8: i64,
    pub ot9: i64,
    pub ot10: i64,
    pub tn: String,
    pub tc: String,
    pub tid: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct H {
    pub ta: String,
    pub q1: i64,
    pub s: i64,
    pub q2: i64,
    pub q3: i64,
    pub q4: i64,
    pub ot1: i64,
    pub ot2: i64,
    pub ot3: i64,
    pub ot4: i64,
    pub ot5: i64,
    pub ot6: i64,
    pub ot7: i64,
    pub ot8: i64,
    pub ot9: i64,
    pub ot10: i64,
    pub tn: String,
    pub tc: String,
    pub tid: i64,
}


pub struct Match {
    pub home_team_id: i64,
    pub away_team_id : i64
}
