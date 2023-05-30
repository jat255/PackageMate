require("dotenv").config(); 
require("../trackers").usps(
    process.env.TEST_TRACKING_NUMBER
).then(
    res => console.log(
        require("../parsers").usps([res]))
        
)
