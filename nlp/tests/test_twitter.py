import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
from desci_sense.shared_functions.dataloaders.twitter.twitter_utils import (
    extract_external_ref_urls,
    scrape_tweet,
    extract_twitter_status_id,
)


def test_extract_twitter_status_id_from_twitter_url():
    url = "https://twitter.com/TechCrunch/status/1798026045544710492"
    expected_status_id = "1798026045544710492"
    assert extract_twitter_status_id(url) == expected_status_id


def test_extract_twitter_status_id_from_x_url():
    url = "https://x.com/TechCrunch/status/1798026045544710492"
    expected_status_id = "1798026045544710492"
    assert extract_twitter_status_id(url) == expected_status_id


def test_extract_twitter_status_id_invalid_url():
    url = "https://example.com/TechCrunch/status/1798026045544710492"
    assert extract_twitter_status_id(url) is None


def test_extract_twitter_status_id_no_status():
    url = "https://twitter.com/TechCrunch"
    assert extract_twitter_status_id(url) is None


def test_extract_twitter_status_id_malformed_url():
    url = "https://twitter.com/TechCrunch/status/"
    assert extract_twitter_status_id(url) is None


def test_extract_twitter_status_id_with_additional_parameters():
    url = (
        "https://twitter.com/TechCrunch/status/1798026045544710492?ref_src=twsrc%5Etfw"
    )
    expected_status_id = "1798026045544710492"
    assert extract_twitter_status_id(url) == expected_status_id


def test_ext_urls():
    test_urls = [
        ("https://twitter.com/maksym_andr/status/1722235666724192688", True),
        ("https://twitter.com/mpshanahan/status/1722283975450722407", False),
        ("https://twitter.com/victorveitch/status/1722303746397409698", False),
        ("https://twitter.com/HarvardPSC/status/1722102271792603452", False),
        ("https://twitter.com/cognazor/status/1722598121887117753", True),  # qrt,
        ("https://twitter.com/soldni/status/1724094517970882959", False),
    ]

    for case, label in test_urls:
        tweet = scrape_tweet(case)
        assert (
            tweet.has_refs() == label
        ), f"{case} has_refs? = {tweet.has_refs()} - mismatch with {label}"


def test_problem_tweet_i92():
    # https://github.com/Common-SenseMakers/sensemakers/issues/92
    url = "https://twitter.com/JingyiQiu4/status/1792956482851663941"
    tweet = scrape_tweet(url)
    assert tweet.ref_urls == ["https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4778120"]


def test_problem_tweet_i31():
    # https://github.com/csensemakers/desci-sense/issues/31
    test_urls = [("https://twitter.com/victorveitch/status/1722300572554969090", True)]

    for case, label in test_urls:
        tweet = scrape_tweet(case)
        assert (
            tweet.has_refs() == label
        ), f"{case} has_refs? = {tweet.has_refs()} - mismatch with {label}"


if __name__ == "__main__":
    url = "https://twitter.com/JingyiQiu4/status/1792956482851663941"
    tweet = scrape_tweet(url)
