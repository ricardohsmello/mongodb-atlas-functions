exports = async function(changeEvent) {
    try {
      
        const doc = changeEvent.fullDocument; 
        console.log(`Processing document with id: ${doc._id}`);
        await processDocument(doc);
        
    } catch(err) {
        console.error(err);
    }
};

async function processDocument(doc) {
    const url = 'https://api-inference.huggingface.co/models/finiteautomata/bertweet-base-sentiment-analysis';
    const hf_read_token = context.values.get("HF_value");

    try {
        const sentimental = await getSentimental(url, hf_read_token, doc.sentence);

        if (sentimental) {
            const updated = await updateDocument(doc._id, sentimental);

            if (updated) {
                console.log("Successfully updated the document.");
            } else {
                console.log("Failed to update the document.");
            }
        }

    } catch(err) {
        console.error(err);
    }
}

async function getSentimental(url, token, input) {
    try {
        const response = await context.http.post({
            url: url,
            headers: {
                'Authorization': [`Bearer ${token}`],
                'Content-Type': ['application/json']
            },
            body: JSON.stringify({ inputs: [input] })
        });

        if (response.statusCode === 200) {
            console.log("Successfully received sentimental.");
            const responseData = EJSON.parse(response.body.text());
            return responseData[0];
        } else {
            console.log(`Failed to receive sentimental. Status code: ${response.statusCode}`);
            return null;
        }

    } catch(err) {
        throw err;
    }
}

async function updateDocument(documentId, value) {
    try {
        const mongodb = context.services.get('Cluster0');
        const db = mongodb.db('trigger_example');
        const collection = db.collection('sentimental_analysis');

        const result = await collection.updateOne(
            { _id: documentId },
            { $set: { result: value }}
        );

        return result.modifiedCount === 1;

    } catch(err) {
        throw err;
    }
}
