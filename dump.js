/*
    let test;
let finalStep;
getClass("2182", "CMPS")
    .then((classes) => {
        var result = classes.filter(function (obj) {
            return obj.name == "CMPS 101";
        });
        fetch(result[0].classNumber)
            .then((data) => {
                console.log("Hello");
                console.log(data);
            })
    })
*/


// for (index in details) {
//     if (details[index].trim()) {
//         switch (index) {
//             case "0":
//                 regex = new RegExp("(Wait List)|(Closed)|(Open)", "g");
//                 status = details[index].match(regex)[0];

//                 regex = new RegExp(major + " \\w+", "g");
//                 name = details[index].match(regex)[0];

//                 regex = new RegExp("\\d{2}", "g");
//                 session = details[index].match(regex)[1];

    //                 regex = new RegExp("\\s{3}[\\w ]+", "g");
    //                 fullName = details[index].match(regex)[0].trim();
//                 break;
//             case "3":
//                 regex = /([0-9])\w+/g;
//                 let classNum = details[index].match(regex)[0];
//                 classNumber = classNum;
//                 break;
//             case "4":
//                 instructor = details[index].slice(13);
//                 break;
//             case "5":
//                 location = details[index].slice(16);
//             case "6":
//                 dateTime = details[index].slice(16);
//             case "7":
//                 regex = new RegExp("\\d+ of \\d+");
//                 enrolled = details[index].match(regex);
//                 if (enrolled) {
//                     enrolled = enrolled[0];
//                 }
//         }
//     }
// }