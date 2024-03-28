exports = async function(changeEvent) {
    const doc = changeEvent.fullDocument;
    const url = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';
    const hf_read_token = context.values.get("HF_value");

    try {
        console.log(`Processing document with id: ${doc._id}`);

        // Call Hugging Face API to get the embeddings.
        let response = await context.http.post({
            url: url,
             headers: {
                'Authorization': [`Bearer ${hf_read_token}`],
                'Content-Type': ['application/json']
            },
            body: JSON.stringify({
                inputs: [doc.proverb]
            })
        });

        let responseData = EJSON.parse(response.body.text());

        if(response.statusCode === 200) {
            console.log("Successfully received embedding.");

            const embedding = responseData[0];

            const mongodb = context.services.get('Cluster0');
            const db = mongodb.db('vector_search'); 
            const collection = db.collection('proverbs'); 

            const result = await collection.updateOne(
                { _id: doc._id },
                { $set: { proverb_embedding: embedding }}
            );

            if(result.modifiedCount === 1) {
                console.log("Successfully updated the document.");
            } else {
                console.log("Failed to update the document.");
            }
        } else {
            console.log(`Failed to receive embedding. Status code: ${response.statusCode}`);
        }

    } catch(err) {
        console.error(err);
    }
};
