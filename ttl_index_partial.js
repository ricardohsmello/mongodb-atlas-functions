function sleep(milliseconds) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + milliseconds);
}

for (i = 0; i < 10; i++) {
    v_status = 'FINISHED' 

    db.transaction_ttl_tests.insertOne({
        createdAt: new ISODate(),
        info: 'some description',
        userId: 0,
        status: v_status
    })

    if (i >= 6) {
        sleep(20 * 60 * 1000);
        v_status = 'PROCESSING'
    }    
}

//create index TTL + PARTIAL
db.transaction_ttl_tests.createIndex(
    { createdAt: 1},
    { 
        name: 'Partial-TTL-Index',
        partialFilterExpression: { status: 'FINISHED'},
        expireAfterSeconds: 33000
    }
)