// for url info request
import request from 'request';
import HTMLParser from 'node-html-parser';
const htmlParser = HTMLParser;
export default async (req, res) => {
    if (!req.user) {
        console.log('unallowed urlinfo request rejected');
        res.sendStatus(401);
        return;
    }
    const url = req.query.url;
    console.log("url request: ", url);
    request(url, (error, response, body) => {
        if (error) {
            res.send({
                success: false,
                errorMessage: error.code
            });
            return;
        }
        const contentType = response.headers['content-type'];
        const root = htmlParser.parse(response.body);
        if (!root.valid) {
            res.send({
                success: false,
                errorMessage: "error parsing body..."
            });
            return;
        }
        const title = root.querySelector('title').text;
        res.send({
            success: true,
            contentType: contentType,
            statusCode: response.statusCode,
            title: title
        });
    });
};
