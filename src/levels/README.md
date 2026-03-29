# Vexed level reading

```json
{
  "metadata": {
    "category": "Ignored",
    "author": "Author",
    "url": "Author's website",
    "description": "Description of the level pack"
  },
  "levels": [
    {
      "board": "10/10/3ba~~3/5~~3/3~~~~3/3a~~b3/4ab4/10",
      "solution": "eCdFdCeC",
      "title": "Title"
    }
  ]
}
```

## Board

* Level format is line-by-line from top-to-bottom. Lines are separated by forward slash (/).  
* Number indicates how many boundary walls are placed.  
* Letters (a-z) indicate a type of tile to place.  
* Tilde (~) indicates a blank tile.  

## Solution

* Solution is a small string where case determines drag direction.  
* Lowercase indicates drag right, uppercase indicates drag left.  
* Each two-character pair indicates which position on the board should be moved (column first, then row).  
* Counting starts in the upper left corner of the level.  
* The length of the solution defines the "par" score.  
