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
    pub gdte: String,
    pub mid: i64,
    pub next: String,
    pub g: Vec<G>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct G {
    pub gid: String,
    pub gcode: String,
    pub p: Value,
    pub st: String,
    pub stt: String,
    pub cl: Value,
    pub v: V,
    pub h: H,
    pub lm: Lm,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct V {
    pub tid: i64,
    pub q1: String,
    pub ot1: String,
    pub s: String,
    pub ot2: String,
    pub ot3: String,
    pub ot4: String,
    pub ot5: String,
    pub ot6: String,
    pub ot7: String,
    pub ot8: String,
    pub ot9: String,
    pub ot10: String,
    pub q2: String,
    pub q3: String,
    pub q4: String,
    pub ta: String,
    pub tn: String,
    pub tc: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct H {
    pub tid: i64,
    pub q1: String,
    pub ot1: String,
    pub s: String,
    pub ot2: String,
    pub ot3: String,
    pub ot4: String,
    pub ot5: String,
    pub ot6: String,
    pub ot7: String,
    pub ot8: String,
    pub ot9: String,
    pub ot10: String,
    pub q2: String,
    pub q3: String,
    pub q4: String,
    pub ta: String,
    pub tn: String,
    pub tc: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Lm {
    pub gdte: Option<String>,
    pub gres: String,
    pub seri: String,
    pub gid: String,
}

pub struct Match {
    pub home_team_id: i64,
    pub away_team_id : i64
}
