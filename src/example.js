const data = JSON.parse(fs.readFileSync('./mydata.json'));
const writeData = ()=>{
  const str = JSON.stringify(data);
  fs.writeFileSync('./mydata.json', str);
};

new Endpoint(service.route('/entries'), {
    query: new CustomQuery({ update: ()=>data }),
    filter: (e, req) => {
        return (req.user && e.userId === req.user.sub) ? e : undefined;
    },
    add: async (obj, req) => {
        if (req.user.sub !== 1) return;
        data.push(obj);
        writedata();
    },
    delete: async (obj, _req) => {
        console.log(obj);
        return 'NOT IMPLEMENTED';
    },
    update: async (newObj, oldObj, _req) => {
        console.log(newObj, oldObj);
        return 'NOT IMPLEMENTED';
    }
});
