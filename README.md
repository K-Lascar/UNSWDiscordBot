# DiscordBot

This program is a DiscordBot, that I'm currently working on in order to get more experience using javascript and interacting with discord!

If you would like to use a discord bot that retrieves the handbook details for UNSW, please use this bot designed by both [Office-Stapler](https://github.com/Office-Stapler) and [V-Wong](https://github.com/V-Wong) here: https://github.com/Office-Stapler/handbook.



After planning what to do with this bot, I've decided we should have the following implementations:

## IMPLEMENTATION

1. Job Salary Search  :white_check_mark:

   - Depending on which field you are as a student, you may want to know what is the salary for your aspiring job.
   - I am thankful for [Indeed](indeed.com.au/) for still having this ability in place (if it weren't, I wouldn't be able to have this functionality)
     - If [Indeed](indeed.com.au/) removes this functionality, I will update the data source with [reed](https://www.reed.co.uk/developers/jobseeker) (UK Salary Data) and/or [usajobs.gov](https://developer.usajobs.gov/) (US Government Data of Jobs).
     - I had problems understanding the [documentation](https://opensource.indeedeng.io/api-documentation/) as some terms like [publishers](https://www.indeed.com/publisher) (this link redirects to hiring) no longer exist on the site, but are still used in the [documentation](https://opensource.indeedeng.io/api-documentation/docs/job-search/). The most similar example to this implementation is [jobbR](https://rdrr.io/github/dashee87/jobbR/man/getSalary.html), an Indeed API wrapper, however this package still uses the old publisher API (which no longer exists).
2. Play :white_check_mark:

   - If you would like to watch a movie or video that is already on discord, this bot has you covered!
3. Whois (used similarly in the Dyno Bot: <https://dyno.gg/>) :white_check_mark:
   - Retrieves the Joined Date
   - Retrieves the Creation Date
4. Wikipedia (used similarly in the AlphaBot system  <https://www.alphabotsystem.com/alpha-bot>):white_check_mark:

   - If a user queries a particular term using this command, they will receive a summary of this page alongside the image of that Wikipedia page as an embed. 
   - Made possible with the [WikiJS module] (https://dijs.github.io/wiki/index.html)
5. Directions​ :white_check_mark:
   - If a user asks for directions from a particular address, an image of that
     address and UNSW path will be generated using MapBox Direction's API.

   - Side note I used the path-gradients repo created by the MapBox team (more info in the [.gitmodules](https://github.com/mapbox/path-gradients/tree/404530e28d92ed47719d0c4d87994249e2467a11)).

     - I modified the code to fit the circumstances of this program (particularly retrieving arguments from the command line slicing them and swapping the Long and Lat using the provided coordsUtils.js). This was used instead of the hardcoded coordinates example.
   
       
   
       ```js		
       path-gradients/main.js
       const {swapLngLat} = require("./coordsUtils");
       // USE ARGV from process + and JSON.PARSE
       // https://stackoverflow.com/questions/41402834/convert-string-array-to-array-in-javascript
       
       var coordinates = JSON.parse(process.argv.slice(-1));
       const coords = swapLngLat(coordinates);
       ```
   
       
   
   - The map is outputted as an embed.
6. Weather (used similarly in the AlphaBot system  <https://www.alphabotsystem.com/alpha-bot> and in the Facebook AI chatbot https://github.com/girliemac/fb-apiai-bot-demo/)  :white_check_mark:
   - Currently the weather is retrieved from OpenWeatherMap.org <https://openweathermap.org/> and a map is retrieved from <https://www.mapbox.com/> for the provided city.
     - Side note, thank you to both of these organisations for providing a service that is very useful and easy to use!
   - If a user would like to retrieve weather details from a particular city.
   - The current, forecasted max and min temperatures are retrieved.
   - A map of the location is outputted in a embed.

7. Prefix Updater:white_check_mark:

   - Since discord channels may have multiple prefixes with their server bots (clashes), they may want to change what this bot's prefix is.
   

Happy Coding Everyone!!! :smile: 
