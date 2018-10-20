/* Changes id to required mongo object id

	Use: When obtaining an array of JSON objects from local storage, it will
		be in string form. So json parse result and return json array 

	mongoJsonify(localStorage("name_of_data"))

*/
export function mongoJsonify(result) {
    result = JSON.parse(result);
    for (var index = 0; index < result.length; index += 1) {
        if (result[index]._id)
            result[index]._id = new Mongo.ObjectID(result[index]._id._str);
    }
    return result;
}