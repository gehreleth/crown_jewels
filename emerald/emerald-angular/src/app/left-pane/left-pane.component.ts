import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-left-pane',
  templateUrl: './left-pane.component.html',
  styleUrls: ['./left-pane.component.css']
})
export class LeftPaneComponent implements OnInit {
  public data:any = [
          {
              "data":{
                  "name":"Andrew",
                  "gender":"Male"
              },
              "children":[
                  {
                      "data":{
                          "name":"Andrewson",
                          "gender":"Male"
                      },
                      "children":[
                          {
                              "data":{
                                  "name":"Eric",
                                  "gender":"Male"
                              }
                          }
                      ]
                  }
              ]
          }
      ];

  constructor() { }

  ngOnInit() {
  }

}
