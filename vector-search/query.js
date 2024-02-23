exports = async function(changeEvent) {
    const doc = changeEvent.fullDocument;
    const url = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';
    const hf_read_token = context.values.get("HF_value");

    try {
        console.log(`Processing document with id: ${doc._id}`);

        let response = await context.http.post({
            url: url,
             headers: {
                'Authorization': [`Bearer ${hf_read_token}`],
                'Content-Type': ['application/json']
            },
            body: JSON.stringify({
                inputs: [doc.query]
            })
        });

        
        let responseData = EJSON.parse(response.body.text());

        // Check the response status.
        if(response.statusCode === 200) {
            console.log("Successfully received embedding.");

            const embedding = responseData[0];

            const mongodb = context.services.get('Cluster0');
            const db = mongodb.db('vector_search'); 
            const proverbs_collection = db.collection('proverbs');  
            const queries_collection = db.collection('queries'); 
            
            // Query for similar documents.
            const documents = await proverbs_collection.aggregate([
            {
             "$search": {
                   "index": "vector_search_index",
                   "knnBeta": {
                       "vector": embedding,
                       "path": "proverb_embedding",
                       "k": 2
                       }
                   }
            },
            {
             "$project":{
                  "_id":0,
                  "proverb":1
                 }
            }
            ]).toArray();
            
           // Update the document in MongoDB.
           const result = await queries_collection.updateOne(
                  { _id: doc._id },
             // The "answer" field will contain the query result.
                { $set: { query_embedding: embedding , answer: documents  }}
              );

        } else {
            console.log(`Failed to receive embedding. Status code: ${response.statusCode}`);
        }

    } catch(err) {
        console.error(err);
    }
};