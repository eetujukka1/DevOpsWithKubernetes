const string = crypto.randomUUID()

setInterval(() => {
    console.log(`${new Date().toISOString()}: ${string}`);
}, 5000);