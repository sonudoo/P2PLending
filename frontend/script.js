var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        let data = JSON.parse(this.responseText);
        let s = `<thead style="font-weight: bold;">
        <td>Request Id</td>
        <td>Requestor</td>
        <td>Amount</td>
    </thead>`;
        for (let i in data) {
            console.log(data[i]);
            if (data[i].isPending != 0) {
                s += "<tr><td>" + data[i].requestId + "</td><td><a href='#' onclick='getinfo(" + data[i].receiver.split("#")[1] + ")'>" + data[i].receiver.split("#")[1] + "</a></td><td>" + data[i].amount + "</td></tr>";
            }
        }
        document.getElementById("table").innerHTML = s;
    }
};
xhttp.open("GET", "http://13.66.171.188:3000/api/Request", true);
xhttp.send();

function getinfo(id) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let request = JSON.parse(this.responseText);
            var xhttp1 = new XMLHttpRequest();
            xhttp1.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    let lend = JSON.parse(this.responseText);
                    var xhttp2 = new XMLHttpRequest();
                    xhttp2.onreadystatechange = function () {
                        if (this.readyState == 4 && this.status == 200) {
                            let repayment = JSON.parse(this.responseText);
                            console.log(request);
                            console.log(lend);
                            console.log(repayment);
                            let totr = 0;
                            let totl = 0;
                            let totp = 0;
                            for (let i in request) {
                                if (request[i].receiver.split("#")[1] != id) {
                                    continue;
                                }
                                totr++;
                                for (let j in lend) {
                                    if (lend[j].request.split("#")[1] != request[i].requestId) continue;
                                    totl++;
                                    let paid = false;
                                    for (let k in repayment) {
                                        if (repayment[k].lend.split("#")[1] == lend[j].lendId) {
                                            paid = true;
                                            break;
                                        }
                                    }
                                    if (paid) {
                                        totp++;
                                    }
                                }
                            }
                            let creditscore = 0;
                            if (totr == totl - totp) {
                                creditscore = "High";
                            }
                            else {
                                creditscore = 1 / (totr - (totl - totp));
                            }
                            document.getElementById("modal-body").innerHTML = `
                            <center><b>Total requests:</b> `+ totr + `<br><br><b>Total Debts:</b> ` + totl + `<br><br>
                            <b>Total Repaid:</b> `+ totp + `
                            <br><br><b>Credit Score:</b> `+ creditscore;
                            $('#myModal').modal('show');
                        }
                    };
                    xhttp2.open("GET", "http://13.66.171.188:3000/api/Repayment", true);
                    xhttp2.send();
                }
            };
            xhttp1.open("GET", "http://13.66.171.188:3000/api/Lend", true);
            xhttp1.send();
        }
    };
    xhttp.open("GET", "http://13.66.171.188:3000/api/Request", true);
    xhttp.send();
}
