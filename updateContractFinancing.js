exports = async function(changeEvent) {
  try {
    const doc = changeEvent.fullDocument;
    console.log(`Processing contract number: ${doc.nro_contrato}`);

    const mongodb = context.services.get('Cluster0');
    const db = mongodb.db('caixa');
    const collection = db.collection('financing');

    const updateResult = await collection.updateOne(
      { contract_number: doc.nro_contrato },
      {
        $set: {
          outstanding_balance: doc.outstanding_balance
        },
        $inc: {
          remaining_term: -1
        }
      }
    );

    if (updateResult.modifiedCount === 1) {
      console.log('Financing updated successfully');
    } else {
      console.log('No documents updated');
    }
  } catch(err) {
    console.log('Error performing MongoDB write:', err.message);
  }
};
