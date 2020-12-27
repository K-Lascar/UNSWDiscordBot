from geotext import GeoText
from sys import argv

# We capitalise arguments because the dataset GeoText retrieves is in this form.
def capitalise_args():
    return "".join(argv[1:]).title()

if __name__ == "__main__":
    city = GeoText(capitalise_args()).cities

    if city != []:
        print(city[-1], end="")
    else:
        print(city, end="")