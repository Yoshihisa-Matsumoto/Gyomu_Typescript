
import { Csv2Json, Json2Csv } from '../csv';

import {  tmpDir, validateTextFiles } from './baseClass';
import {test,expect} from 'vitest';


test('csv read test', async () => {
    let dataResult = await Csv2Json('tests/test.utf8.csv');
    
    if(dataResult.isErr()){
        expect(dataResult.isOk()).toBeTruthy();
    }else{
        const data = dataResult.value;
        console.log(data);
        expect(data.length).toBe(6);
    }

    dataResult = await Csv2Json('tests/test.utf8.bom.csv',{bom:true});

    if(dataResult.isErr()){
        console.log(dataResult.error);
        expect(dataResult.isOk()).toBeTruthy();
    }else{
        const data = dataResult.value;
        console.log(data);
        expect(data.length).toBe(6);
    }

    dataResult = await Csv2Json('tests/test.shiftjis.csv');

    if(dataResult.isErr()){
        expect(dataResult.isOk()).toBeTruthy();
    }else{
        const data = dataResult.value;
        console.log(data);
        expect(data.length).toBe(6);
    }

    dataResult = await Csv2Json('tests/test.utf8.bom.csv',{bom:true,filterFn:(data)=>data['UserName']=='西澤 智也'});
    if(dataResult.isErr()){
        expect(dataResult.isOk()).toBeTruthy();
    }else{
        const data = dataResult.value;
        console.log(data);
        expect(data.length).toBe(1);
    }
});

test('csv write test', async()=>{
    const testData = [{a:'test',b:'abc'},{a:'nextrecord',b:'def'}];

    // const result1 = await Json2CSV(testData);
    // if(result1.isFailure()){
    //     console.log(result1.error);
    //     expect(result1.isSuccess()).toBeTruthy();
    //     return;
    // }
    const result2 = await Json2Csv(testData);
    if(result2.isErr()){
        console.log(result2.error);
        expect(result2.isOk()).toBeTruthy();
        return;
    }
    //let dataValue =result2.value as string;
    //console.log(dataValue);
    
    //expect(dataValue).toBe('a,b\n'+'test,abc\n' + 'nextrecord,def\n');


    const result3 = await Json2Csv(testData,{fields:{a:'field1',b:'field2'}});
    if(result3.isErr()){
        console.log(result3.error);
        expect(result3.isOk()).toBeTruthy();
        return;
    }
    //dataValue =result3.value as string;
    //console.log(dataValue);
    // const data1=result1.value as string;
    // const data2 = result2.value as string;
    // expect(data1).toBe(data2);
    
});

test('csv read/write compare test', async()=>{
    const dataResult = await Csv2Json('tests/test.utf8.csv');

    if(dataResult.isErr()){
        expect(dataResult.isOk()).toBeTruthy();
        return;
    }
    const data = dataResult.value;
    const outputFilename= tmpDir()+ 'csv-read-write.csv';
    const fileResult = await Json2Csv(data,{outputFilename:outputFilename, quoted:true});
    if(fileResult.isErr()){
        expect(fileResult.isOk()).toBeTruthy();
        return;
    }
    expect(fileResult.value).toBeTruthy();

    validateTextFiles('tests/test.utf8.csv',outputFilename);
    
})

import { rowsFromZip, rowsFromGzip } from '../csv';

test('rowsFromZip: zip内test.csvをストリームで解析', async () => {
    const zipPath = 'tests/test.csv.zip';
    const csvName = 'test.utf8.csv';
    const rows: any[] = [];
    for await (const row of rowsFromZip(zipPath, csvName)) {
        rows.push(row);
    }
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).toBeTypeOf('object');
});

test('rowsFromGzip: gzip内test.csvをストリームで解析', async () => {
    const gzPath = 'tests/test.csv.gz';
    const rows: any[] = [];
    for await (const row of rowsFromGzip(gzPath)) {
        rows.push(row);
    }
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).toBeTypeOf('object');
});