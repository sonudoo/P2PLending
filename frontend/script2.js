var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        let data = JSON.parse(this.responseText);
        let s = `<thead style="font-weight: bold;">
                    <td>Transaction Id</td>
                    <td>Transaction Type</td>
                    <td>Timestamp</td>
                </thead>`;
        for (let i in data) {
            console.log(data[i]);
            s += "<tr><td>" + data[i].transactionId.substr(0,6) + "</td><td>" + data[i].transactionType + "</td><td>"+data[i].transactionTimestamp+"</td></tr>";
        }
        document.getElementById("table").innerHTML = s;
    }
};
xhttp.open("GET", "http://13.66.171.188:3000/api/system/historian", true);
xhttp.send();
