exports = async function(changeEvent) {
  try {
    const doc = changeEvent.fullDocument;
    console.log(`Processing contract number: ${doc.nro_contrato}`);

    const mongodb = context.services.get('Cluster0');
    const db = mongodb.db('caixa');
    const collection = db.collection('financing');

    const updateOperations = {
      $set: {
        outstanding_balance: doc.outstanding_balance
      }
    };
  
    if (doc.is_contribution !== true) {
      updateOperations.$inc = { remaining_term: -1 };
    }

    const updateResult = await collection.updateOne(
      { contract_number: doc.nro_contrato },
      updateOperations
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
