use serde_derive::Deserialize;
use serde_derive::Serialize;
use serde_json::Value;
use crate::models::game_with_odds::Odds;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameOdds {
    #[serde(rename = "__N_SSP")]
    pub n_ssp: bool,
    pub page_props: PageProps,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PageProps {
    pub header: String,
    pub odds_tables: Vec<OddsTable>,
    pub league: String,
    pub string_scope: String,
    pub is_favorites: bool,
    pub breadcrumb_list_object: BreadcrumbListObject,
    pub sport_list_object: String,
    #[serde(skip_deserializing)]
    pub betting_article: BettingArticle,
    #[serde(rename = "schemaFAQ")]
    pub schema_faq: String,
    pub football_leauge_landing: bool,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OddsTable {
    pub league: String,
    pub odds_table_model: OddsTableModel,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OddsTableModel {
    pub game_rows: Vec<GameRow>,
    pub sportsbooks: Vec<Sportsbook>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameRow {
    pub game_view: GameView,
    pub odds_views: Vec<Option<OddsView>>,
    pub opening_line_views: Vec<Option<OpeningLineView>>,
    pub live_score_views: LiveScoreViews,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameView {
    pub game_id: i64,
    pub league_name: String,
    pub start_date: String,
    pub away_team: AwayTeam,
    pub away_team_rotation_number: String,
    pub away_starter: Value,
    pub away_team_score: i64,
    pub home_team: HomeTeam,
    pub home_starter: Value,
    pub home_team_rotation_number: String,
    pub home_team_score: i64,
    pub game_status_text: String,
    pub status: String,
    pub venue_name: String,
    pub city: String,
    pub state: String,
    pub country: String,
    pub consensus: Option<Consensus>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AwayTeam {
    pub name: String,
    pub full_name: String,
    pub short_name: String,
    pub display_name: String,
    pub nickname: String,
    pub rank: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HomeTeam {
    pub name: String,
    pub full_name: String,
    pub short_name: String,
    pub display_name: String,
    pub nickname: String,
    pub rank: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Consensus {
    pub home_money_line_pick_percent: i64,
    pub away_money_line_pick_percent: i64,
    pub home_spread_pick_percent: f64,
    pub away_spread_pick_percent: f64,
    pub over_pick_percent: f64,
    pub under_pick_percent: f64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OddsView {
    pub game_id: i64,
    pub sportsbook: String,
    pub sportsbook_id: Value,
    pub view_type: String,
    pub opening_line: OpeningLine,
    pub current_line: CurrentLine,
    pub money_line_history: Value,
    pub spread_history: Value,
    pub total_history: Value,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OpeningLine {
    pub odds: Value,
    pub home_odds: i64,
    pub away_odds: i64,
    pub over_odds: Value,
    pub under_odds: Value,
    pub draw_odds: i64,
    pub home_spread: Value,
    pub away_spread: Value,
    pub total: Value,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CurrentLine {
    pub odds: Value,
    pub home_odds: i64,
    pub away_odds: i64,
    pub over_odds: Value,
    pub under_odds: Value,
    pub draw_odds: i64,
    pub home_spread: Value,
    pub away_spread: Value,
    pub total: Value,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OpeningLineView {
    pub game_id: i64,
    pub sportsbook: String,
    pub sportsbook_id: Value,
    pub view_type: String,
    pub opening_line: OpeningLine2,
    pub current_line: CurrentLine2,
    pub money_line_history: Value,
    pub spread_history: Value,
    pub total_history: Value,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OpeningLine2 {
    pub odds: Value,
    pub home_odds: i64,
    pub away_odds: i64,
    pub over_odds: Value,
    pub under_odds: Value,
    pub draw_odds: i64,
    pub home_spread: Value,
    pub away_spread: Value,
    pub total: Value,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CurrentLine2 {
    pub odds: Value,
    pub home_odds: i64,
    pub away_odds: i64,
    pub over_odds: Value,
    pub under_odds: Value,
    pub draw_odds: i64,
    pub home_spread: Value,
    pub away_spread: Value,
    pub total: Value,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LiveScoreViews {
    pub viewdata: Viewdata,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Viewdata {
    #[serde(rename = "GameTeamScoreDataList")]
    pub game_team_score_data_list: Value,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Sportsbook {
    pub sportsbook_id: Option<String>,
    pub name: String,
    pub slug: String,
    pub machine_name: String,
    pub affiliate_link: String,
    pub icon: String,
    pub icon_monochrome: IconMonochrome,
    pub icon_color: IconColor,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IconMonochrome {
    #[serde(rename = "type")]
    pub type_field: String,
    pub title: String,
    pub file_name: String,
    pub url: Value,
    pub alt: Value,
    pub width: i64,
    pub height: i64,
    pub caption: Value,
}

#[derive(Default, Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IconColor {
    #[serde(rename = "type")]
    pub type_field: String,
    pub title: String,
    pub file_name: String,
    pub url: Value,
    pub alt: Value,
    pub width: i64,
    pub height: i64,
    pub caption: Value,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BreadcrumbListObject {
    #[serde(rename = "@context")]
    pub context: String,
    #[serde(rename = "@type")]
    pub type_field: String,
    pub item_list_element: Vec<ItemListElement>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ItemListElement {
    #[serde(rename = "@type")]
    pub type_field: String,
    pub name: String,
    pub item: Option<String>,
    pub position: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BettingArticle {
    pub slug: String,
    pub url_path: UrlPath,
    pub date_created: Option<String>,
    pub date_updated: Option<String>,
    pub sections: Vec<Value>,
    pub sportsbooks: Vec<Value>,
    pub sponsored_sportsbooks: Value,
    pub sportsbook_filters: Value,
    pub headline_h1: String,
    pub subheading: Value,
    pub intro: String,
    pub intro_more: Value,
    pub listing_heading: Value,
    pub listing_subheading_link: Value,
    pub listing_subheading: Value,
    pub content: String,
    pub faqs: Faqs,
    pub faqs_heading: Value,
    pub region: i64,
    pub meta_title: String,
    pub meta_description: String,
    pub robots: Value,
    pub canonical: Value,
    pub seo_href: Value,
    pub top_list: String,
    pub banner_image: Value,
    pub banner: Banner,
    pub sidebar: Value,
    pub image_detail: Value,
    pub excerpt: String,
    #[serde(rename = "contentEditorJS")]
    pub content_editor_js: Value,
    pub breadcrumbs: Vec<Breadcrumb>,
    pub breadcrumbs_schema: String,
    pub author: Value,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UrlPath {
    pub path: String,
    pub name: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Faqs {
    pub questions: Vec<Question>,
    pub header: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Question {
    pub question: String,
    pub answer: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Banner {
    pub headline_h1: String,
    pub subheading: Value,
    pub banner_image: Value,
    pub banner_alt: Value,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Breadcrumb {
    pub breadcrumb_name: String,
    #[serde(rename = "breadcrumbURL")]
    pub breadcrumb_url: String,
}

impl OddsView {
    pub fn into_odds(self) -> Odds {
        Odds {
            book_name: self.sportsbook,
            home_team_odds: self.current_line.home_odds as i32,
            away_team_odds: self.current_line.away_odds as i32,
            home_team_opening_odds: self.opening_line.home_odds as i32,
            away_team_opening_odds: self.opening_line.away_odds as i32,
        }
    }
}
