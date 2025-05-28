def filter_topic(text: str) -> bool:
    allowed_keywords = ["ubrania", "sklep", "koszulka", "buty", "rozmiar", "zakupy"]
    return any(word in text.lower() for word in allowed_keywords)

def filter_sentiment(text: str) -> bool:
    negative_keywords = ["nienawidzę", "głupi", "idiota", "beznadziejny"]
    return not any(word in text.lower() for word in negative_keywords)
