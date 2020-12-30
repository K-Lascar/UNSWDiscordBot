# DiscordBot

This program is a DiscordBot, that I'm currently working on in order to get more experience using javascript and interacting with discord!

After planning what to do with this bot, I've decided we should have the following implementations:

## IMPLEMENTATION

1. Job Salary Search
   
   - Depending on which field you are as a student, you may want to know what is the pay for the work that your career unveils.
2. Play :white_check_mark:
   
   - If you would like to watch a movie or video that is already on discord, this bot has you covered!
3. Whois (used similarly in the great dyno bot: <https://dyno.gg/>) :white_check_mark:
   - Retrieves the Joined Date
   - Retrieves the Creation Date
4. AI Chatbot
   
   - If a user was to message the bot, they should provide normal results like the weather or wikipedia page.
5. Directions​ :white_check_mark:
   - If a user asks for directions from a particular address, an image of that
     address and UNSW path will be generated using MapBox Direction's API.
   
   - Side note I used the path-gradients repo created by the MapBox team (more info in the .gitmodules).
   
     - I modified the code to fit the circumstances of this program (particularly retrieving arguments from the command line slicing them and swapping the Long and Lat using the provided coordsUtils.js). This was used instead of the hardcoded coordinates example.
   
       
   
       ```js		
       const {swapLngLat} = require("./coordsUtils");
       // USE ARGV from process + and JSON.LOAD
       // https://stackoverflow.com/questions/41402834/convert-string-array-to-array-in-javascript
       
       var coordinates = JSON.parse(process.argv.slice(-1));
       const coords = swapLngLat(coordinates);
       ```
   
       
   
   - The map is outputted as an embed.
6. Weather (used similarly in the marveled alphabot system  <https://www.alphabotsystem.com/alpha-bot>) :white_check_mark:
   - Currently the weather is retrieved from OpenWeatherMap.org <https://openweathermap.org/> and a map is retrieved from <https://www.mapbox.com/> for the provided city.
     - Side note, thank you for both of these organisations for providing a service that is very useful and easy to use!
   - If a user would like to retrieve weather details from a particular city they can do so.
   - The current, forecasted max and min temperatures are retrieved.
   - A map of the location is outputted in a embed.

7. Prefix Updater:white_check_mark:
   
   - Since discord channels may have multiple prefixes with their server bots (clashes), they may want to change what this bot's prefix is.
