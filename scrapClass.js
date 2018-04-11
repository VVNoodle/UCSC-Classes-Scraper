const request = require("request");
const rp = require("request-promise");
const cheerio = require("cheerio");

const getAllMajors = () => {
    const options = {
        uri: "https://pisa.ucsc.edu/class_search/",
        transform: function (body) {
            return cheerio.load(body);
        }
    };
    rp(options)
        .then(function ($) {

            $('#subject option').each(function (i, opt) {
                console.log($(this).text());
            });

        })
        .catch(function (err) {
            return console.log("Error:", err);
        });
}

const postFormForClasses = (term, major) => {
    const info = {
        url: 'https://pisa.ucsc.edu/class_search/',
        form: {
            action: 'results',
            'binds[:term]': term,
            'binds[:subject]': subject
        }
    }
    return rp.post(info);
}

const getClassesByMajor = (term, major) => {
    return new Promise((resolve, reject) => {
        let classArray = [];

        return postFormForClasses(term, major)
            .then(function (body) {
                const $ = cheerio.load(body);
                const shit = $(".panel").each(function (i, opt) {
                    if (i) {
                        let regex;
                        const details = $(this).text().trim().split("\n");
                        regex = new RegExp(major + " \\w+", "g");
                        name = details[0].match(regex)[0];

                        regex = new RegExp("\\s{3}[\\w ]+", "g");
                        fullName = details[0].match(regex)[0].trim();

                        regex = new RegExp("\\d{2}", "g");
                        session = details[0].match(regex)[1];
                        if (!session) {
                            session = "01";
                        }

                        regex = /([0-9])\w+/g;
                        let classNumber = details[3].match(regex)[0];
                        // classArray.push(new classDetails(name, fullName, session, status, classNumber, instructor, location, dateTime, enrolled));
                        classArray.push({ classNumber, name, fullName, session });
                    }
                });
                resolve(classArray);
            });
    });
}

function getClassDetails(number) {
    return new Promise((resolve, reject) => {
        request.post('https://pisa.ucsc.edu/class_search/', { form: { action: 'detail', 'class_data[:STRM]': "2182", 'class_data[:CLASS_NBR]': number } }, (err, http, body) => {
            if (err) console.log('Error fetching classes', err);
            else {
                const $ = cheerio.load(body);
                let header = [];
                $(".panel-heading-custom").each(function (i, opt) {
                    header.push($(this).text().trim());
                });

                let info = {};
                $(".panel-body").each(function (i, opt) {
                    if (i) {
                        const details = $(this).text().replace(/(\r\n|\n|\r)/gm, "").trim();
                        if (header[i - 1] == "Class Details") {
                            let moreDetail = details.split(/[\s]\s+/);
                            info.classDetails = {};
                            for (x in moreDetail) {
                                moreDetail[x] = moreDetail[x]
                                    // insert a space before all caps
                                    .replace(/([A-Z])/g, ' $1')
                                    // uppercase the first character
                                    .replace(/^./, function (str) { return str.toUpperCase(); })
                                let temp = moreDetail[x].trim();
                            }
                            let temp;
                            for (j in moreDetail) {
                                if (moreDetail[j].includes("Career")) {
                                    temp = moreDetail[j].trim().split(" ")[1];
                                    info.classDetails.career = temp;
                                } else if (moreDetail[j].includes("Grading")) {
                                    temp = moreDetail[j].slice(9);
                                    info.classDetails.grading = temp;
                                } else if (moreDetail[j].includes("Class  Number")) {
                                    temp = moreDetail[j].slice(14);
                                    info.classDetails.classNumber = temp;
                                } else if (moreDetail[j].includes("Type")) {
                                    temp = moreDetail[j].slice(5);
                                    info.classDetails.type = temp;
                                } else if (moreDetail[j].includes("Credits")) {
                                    temp = moreDetail[j].slice(8);
                                    info.classDetails.credits = temp;
                                } else if (moreDetail[j].includes("General  Education")) {
                                    temp = moreDetail[j].slice(19);
                                    if (!temp) {
                                        temp = "Does not satisfy any";
                                    }
                                    info.classDetails.ge = temp;
                                } else if (moreDetail[j].includes("Status")) {
                                    temp = moreDetail[j].slice(9);
                                    info.classDetails.status = temp;
                                } else if (moreDetail[j].includes("Available  Seats")) {
                                    temp = moreDetail[j].slice(17);
                                    info.classDetails.availableSeats = temp;
                                } else if (moreDetail[j].includes("Enrollment  Capacity")) {
                                    temp = moreDetail[j].slice(21);
                                    info.classDetails.capacity = temp;
                                } else if (moreDetail[j].includes("Enrolled")) {
                                    temp = moreDetail[j].slice(9);
                                    info.classDetails.enrolled = temp;
                                } else if (moreDetail[j].includes("Wait  List  Capacity")) {
                                    temp = moreDetail[j].slice(21);
                                    info.classDetails.waitCapacity = temp;
                                } else if (moreDetail[j].includes("Wait  List  Total")) {
                                    temp = moreDetail[j].slice(18);
                                    info.classDetails.waitTotal = temp;
                                }
                            }
                        } else if (header[i - 1] == "Description") {
                            info.description = details;
                        }
                        else if (header[i - 1] == "Enrollment Requirements") {
                            info.prereq = details.replace("Prerequisite(s): ", "").replace(".", "");
                        }
                        else if (header[i - 1] == "Class Notes") {
                            info.notes = details;
                        }
                        else if (header[i - 1] == "Meeting Information") {
                            info.meetingInfo = {};
                            const alt = $(this).text();
                            info.meetingInfo.dayTime = details.match(/(TuTh|MWF|Tu|Thu) \d{2}:\d{2}(PM|AM)-\d{2}:\d{2}(PM|AM)/g)[0];
                            info.meetingInfo.dates = details.match(/\d{2}\/\d{2}\/\d{2} - \d{2}\/\d{2}\/\d{2}/)[0];
                            info.meetingInfo.instructor = details.match(/[A-Z][a-z]+\s?[A-z]+,([A-Z].)+/)[0];
                            info.meetingInfo.location = details.match(/(AM|PM)\s+[\w ]+/)[0].split(/\s\s+/)[1];
                        } else if (header[i - 1] == "Associated Discussion Sections or Labs") {
                            let arr = details.split(/\s\s+/);

                            info.section = [arr / 7];
                            let index = 0;
                            for (let x = 0; x < arr.length - 1; x += 7) {
                                info.section[index] = {};
                                info.section[index].name = arr[x];
                                info.section[index].dateTime = arr[x + 1];
                                info.section[index].staff = arr[x + 2];
                                info.section[index].location = arr[x + 3].slice(4);
                                info.section[index].enrolled = arr[x + 4].slice(5);
                                info.section[index].waitlist = arr[x + 5].slice(5);
                                info.section[index].status = arr[x + 6];
                                index++;
                            }
                        }
                    }
                });
                resolve(info);
            }
        });
    });
};

module.exports = {
    getAllMajors,
    getClasses,
    getClass,
    fetch
}
