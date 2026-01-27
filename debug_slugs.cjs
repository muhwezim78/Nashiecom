const https = require('https');

https.get('https://choicehotspot.online/nashie/api/categories', (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.data && json.data.categories) {
                console.log("Categories found:", json.data.categories.length);
                json.data.categories.forEach(c => {
                    console.log(`Name: ${c.name}, Slug: ${c.slug}, ID: ${c.id}`);
                });
            } else {
                console.log("No categories found in data");
            }
        } catch (e) { console.error(e); }
    });
}).on("error", (err) => { console.log("Error: " + err.message); });
