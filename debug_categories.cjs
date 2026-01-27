const https = require('https');

https.get('https://choicehotspot.online/nashie/api/categories', (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
        data += chunk;
    });

    // The whole response has been received.
    resp.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2));

            // Analyze the data
            if (json.data && json.data.categories) {
                const cats = json.data.categories;
                console.log("\nAnalyze Categories:");
                console.log("Count:", cats.length);
                console.log("First Category Keys:", Object.keys(cats[0] || {}));
                console.log("Featured count:", cats.filter(c => c.featured).length);
            } else {
                console.log("Structure unexpected:", Object.keys(json));
            }

        } catch (e) {
            console.error(e);
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
