var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        let data = JSON.parse(this.responseText);
        let s = `<thead style="font-weight: bold;">
                    <td>Pariticipant Id</td>
                    <td>Balance</td>
                </thead>`;
        for (let i in data) {
            console.log(data[i]);
            if (data[i].isPending != 0) {
                s += "<tr><td>" + data[i].participantId + "</td><td>" + data[i].balance + "</td></tr>";
            }
        }
        document.getElementById("table").innerHTML = s;
    }
};
xhttp.open("GET", "http://13.66.171.188:3000/api/Person", true);
xhttp.send();
