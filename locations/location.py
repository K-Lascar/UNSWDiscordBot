from geotext import GeoText
from sys import argv

def capitaliseArgs():
    return " ".join(list(map(lambda x: x.capitalize(), argv[1:])))

if __name__ == "__main__":
    city = GeoText(capitaliseArgs()).cities
    if city != []:
        print(city[-1], end="")
    else:
        print(city, end="")