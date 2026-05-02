"""Constants for games module."""

from __future__ import annotations

# Bookmaker ID mapping for ActionNetwork odds
BOOKMAKER_NAMES: dict[int, str] = {
    0: "Unknown",
    255: "Fanduel",
    280: "BetMGM",
    68: "DraftKings",
    246: "Unibet",
    264: "US",
    74: "BetPARX",
    1906: "Caesars",
    76: "Pointsbet",
}

# Bookmaker IDs to skip (low quality or duplicate)
BOOK_IDS_TO_SKIP: set[int] = {15, 30, 264, 110, 75}

# NBA stadium/arena location data
LOCATION_DATA: dict[str, dict[str, str]] = {
    "ATL": {"name": "State Farm Arena", "city": "Atlanta", "state": "GA"},
    "BOS": {"name": "TD Garden", "city": "Boston", "state": "MA"},
    "BRK": {"name": "Barclays Center", "city": "Brooklyn", "state": "NY"},
    "CHA": {"name": "Spectrum Center", "city": "Charlotte", "state": "NC"},
    "CHI": {"name": "United Center", "city": "Chicago", "state": "IL"},
    "CLE": {"name": "Rocket Mortgage FieldHouse", "city": "Cleveland", "state": "OH"},
    "DAL": {"name": "American Airlines Center", "city": "Dallas", "state": "TX"},
    "DEN": {"name": "Ball Arena", "city": "Denver", "state": "CO"},
    "DET": {"name": "Little Caesars Arena", "city": "Detroit", "state": "MI"},
    "GSW": {"name": "Chase Center", "city": "San Francisco", "state": "CA"},
    "HOU": {"name": "Toyota Center", "city": "Houston", "state": "TX"},
    "IND": {"name": "Gainbridge Fieldhouse", "city": "Indianapolis", "state": "IN"},
    "LAC": {"name": "Crypto.com Arena", "city": "Los Angeles", "state": "CA"},
    "LAL": {"name": "Crypto.com Arena", "city": "Los Angeles", "state": "CA"},
    "MEM": {"name": "FedExForum", "city": "Memphis", "state": "TN"},
    "MIA": {"name": "FTX Arena", "city": "Miami", "state": "FL"},
    "MIL": {"name": "Fiserv Forum", "city": "Milwaukee", "state": "WI"},
    "MIN": {"name": "Target Center", "city": "Minneapolis", "state": "MN"},
    "NOP": {"name": "Smoothie King Center", "city": "New Orleans", "state": "LA"},
    "NYK": {"name": "Madison Square Garden", "city": "New York", "state": "NY"},
    "OKC": {"name": "Paycom Center", "city": "Oklahoma City", "state": "OK"},
    "ORL": {"name": "Amway Center", "city": "Orlando", "state": "FL"},
    "PHI": {"name": "Wells Fargo Center", "city": "Philadelphia", "state": "PA"},
    "PHX": {"name": "Footprint Center", "city": "Phoenix", "state": "AZ"},
    "POR": {"name": "Moda Center", "city": "Portland", "state": "OR"},
    "SAC": {"name": "Golden 1 Center", "city": "Sacramento", "state": "CA"},
    "SAS": {"name": "AT&T Center", "city": "San Antonio", "state": "TX"},
    "TOR": {"name": "Scotiabank Arena", "city": "Toronto", "state": "ON"},
    "UTA": {"name": "Vivint Arena", "city": "Salt Lake City", "state": "UT"},
    "WAS": {"name": "Capital One Arena", "city": "Washington D.C.", "state": "DC"},
}
