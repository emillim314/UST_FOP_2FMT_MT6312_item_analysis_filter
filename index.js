const csv = require('csv-parser');
const csv_writer_creator = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

const FILTER_CONTROL_NUMBER = [5,6,7,8,9,11,14,18,19,21,22,23,24,25,26,27,28,29,30,31,32,33,35,38,39,44,49,51,52,53,54,55,56,57,58,59,60,61,62,63,64,74,75,76,81,82,85,86,87,88,90,92,94,95,96,97,98,103,104,106,107,108,110,114,115,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,135,136,137,138,141,143,145,146,147,148,149,150,152,153,154,155,156,157,158,159,160,162,166,169,178,180,181,182,183,184,185,186,187,188,189,190,191,192,194,195,196,197,198,199,204,205,206,212,213,214,216,217,218,219,220,221,223,224]

function is_valid(datum)
{
  for (let fcn of FILTER_CONTROL_NUMBER)
  {
    if (datum == fcn) return true;
  }
  return false;
}

function write_csv(filename, data)
{
  csv_writer = csv_writer_creator({
    path: filename,
    header: [
      {id:'control number', title:'control number'},
      {id:'PRE:answer', title:'PRE:answer'},
      {id:'POST:answer', title:'POST:answer'},
      {id:'PRE:correct', title:'PRE:correct'},
      {id:'POST:correct', title:'POST:correct'},
      {id:'score change', title:'score change'},
      {id:'improved', title:'improved'}
    ]
  });
  csv_writer.writeRecords(data).then(()=>{console.log(`CSV file '${filename}' written.`)});
}


function data_complete(row, pre_header, post_header)
{
  return row[pre_header] && row[post_header];
}

function process_data(row, pre_header, post_header, answer)
{
  let row_data = {
    'control number':row['Control No.'],
    'PRE:answer':row[pre_header],
    'POST:answer':row[post_header]
  };
  if (row[pre_header] == answer)
  {
    row_data['PRE:correct'] = 1;
  }
  else
  {
    row_data['PRE:correct'] = 0;
  }
  if (row[post_header] == answer)
  {
    row_data['POST:correct'] = 1;
  }
  else
  {
    row_data['POST:correct'] = 0;
  }
  row_data['score change'] = (row_data['PRE:correct'] != row_data['POST:correct'])?1:0;
  row_data['improved'] = (row_data['POST:correct'] + row_data['score change'] == 2)?1:0;
  return row_data;
}

function process(filename, pre_header, post_header, answer)
{
  return new Promise(
    (resolve, reject) => {
      let out = [];
      fs.createReadStream(filename)
        .pipe(csv())
        .on('data', (row) => {
          if (is_valid(row['Control No.']) && data_complete(row, pre_header, post_header))
          {
            out.push(process_data(row, pre_header, post_header, answer));
          }
        })
        .on('end', () => {
          resolve(out.sort((value1,value2)=>{return value1['control number'] - value2['control number']}));
        });
    }
  );
}

(async ()=>{
  let COVID1 = await process('data/COVID.csv', 'PRE:1. Ang COVID-19 ay isang nakakahawang sakit na nagmula sa isang:','POST:1. Ang COVID-19 ay isang nakakahawang sakit na nagmula sa isang:','Virus');
  let COVID2 = await process('data/COVID.csv', 'PRE:2. Ang COVID-19 ay naipapasa sa pamamagitan ng?','POST:2. Ang COVID-19 ay naipapasa sa pamamagitan ng?','A at B lamang');
  let COVID3 = await process('data/COVID.csv', 'PRE:3. Alin ang mga sintomas para sa mga banayad (mild) na kaso ng COVID-19?','POST:3. Alin ang mga sintomas para sa mga banayad (mild) na kaso ng COVID-19?','A, B, at C');
  let COVID4 = await process('data/COVID.csv', 'PRE:4. Alin ang mga sintomas para sa mga katamtaman (moderate) na kaso ng COVID-19?','POST:4. Alin ang mga sintomas para sa mga katamtaman (moderate) na kaso ng COVID-19?','A, B, at C');
  let COVID5 = await process('data/COVID.csv', 'PRE:5. Alin ang mga sintomas para sa mga malala (severe) na kaso ng COVID-19?','POST:5. Alin ang mga sintomas para sa mga malala (severe) na kaso ng COVID-19?','A, B, at C');
  let COVID6 = await process('data/COVID.csv', 'PRE:6. Maaari bang magkaiba ang sintomas sa bawat tao?','POST:6. Maaari bang magkaiba ang sintomas sa bawat tao?','Oo, maaaring hindi lahat ng sintomas ay maranasan ng ibang tao.');
  let COVID7 = await process('data/COVID.csv', 'PRE:7. Sino ang higit na maaaring magkaroon ng malulubhang sintomas?','POST:7. Sino ang higit na maaaring magkaroon ng malulubhang sintomas?','Lahat ng nabanggit');
  let COVID8 = await process('data/COVID.csv', 'PRE:8. Ano ang dapat mong gawin kapag may nakasalamuha kang taong positibo sa COVID-19?','POST:8. Ano ang dapat mong gawin kapag may nakasalamuha kang taong positibo sa COVID-19?','Mag self-quarantine o manatili sa bahay ng 14 na araw matapos ang huling kontak sa nag positibo at subaybayan ang sarili para sa mga sintomas');
  let COVID9 = await process('data/COVID.csv', 'PRE:9. Ano ang dapat mong gawin kapag nag positibo ka sa COVID-19?','POST:9. Ano ang dapat mong gawin kapag nag positibo ka sa COVID-19?','Lahat ng nabanggit.');
  let COVID10 = await process('data/COVID.csv', 'PRE:10. Kailan ligtas na makisalamuha sa iba kung ikaw ay nagpositibo sa COVID-19 at ikaw ay hindi kompromisado ang iyong immune system o nagkaroon ng malubhang kaso? ','POST:10. Kailan ligtas na makisalamuha sa iba kung ikaw ay nagpositibo sa COVID-19 at ikaw ay hindi kompromisado ang iyong immune system o nagkaroon ng malubhang kaso? ','Makalipas ang 10 araw mula nang lumitaw ang unang sintomas, walang lagnat ng 24 na oras nang hindi gumagamit ng pampababa nito, at gumaling na mula sa ibang sintomas.');
  let COVID11 = await process('data/COVID.csv', 'PRE:11. Ang antibiotics ba ay maaaring gamiting gamot para sa COVID-19?','POST:11. Ang antibiotics ba ay maaaring gamiting gamot para sa COVID-19?','Hindi, dahil gamot lamang sa bacteria ang antibiotics at hindi ito gagana sa COVID-19.');
  let COVID12 = await process('data/COVID.csv', 'PRE:12. Ang paglanghap ba ng singaw ng mainit na tubig na may asin o pagsusuob ay nakakagamot sa COVID-19?','POST:12. Ang paglanghap ba ng singaw ng mainit na tubig na may asin o pagsusuob ay nakakagamot sa COVID-19?','Hindi, dahil ito’y hindi gamot para sa COVID-19 at maaari pang makapagdulot ng paso sa gagawa nito.');
  let COVID13 = await process('data/COVID.csv', 'PRE:13. Ang COVID-19 ba ay nakahahawa lang sa mga lugar na may malalamig na klima?','POST:13. Ang COVID-19 ba ay nakahahawa lang sa mga lugar na may malalamig na klima?','Hindi, kumakalat ito sa kahit anong uri ng klima.');
  let COVID14 = await process('data/COVID.csv', 'PRE:14. Ang paghuhugas ng kamay upang maiwasan ang pagkalat ng COVID-19 ay hindi dapat bababa sa:','POST:14. Ang paghuhugas ng kamay upang maiwasan ang pagkalat ng COVID-19 ay hindi dapat bababa sa:','20 segundo');
  let COVID15 = await process('data/COVID.csv', 'PRE:15. Ano ang mga dapat tandaan upang maiwasan ang COVID-19?','POST:15. Ano ang mga dapat tandaan upang maiwasan ang COVID-19?','B at C lamang');
  let vaccine1 = await process('data/vaccine.csv', 'PRE:1. Magkano ang babayaran para sa bakuna laban sa COVID-19?','POST:1. Magkano ang babayaran para sa bakuna laban sa COVID-19?', 'Wala, libre ito sa prayoridad na grupo');
  let vaccine2 = await process('data/vaccine.csv', 'PRE:2. Sino sa mga sumusunod ang hindi kabilang sa mga unang prayoridad (Priority Group A) sa pagkuha ng bakuna?','POST:2. Sino sa mga sumusunod ang hindi kabilang sa mga unang prayoridad (Priority Group A) sa pagkuha ng bakuna?','Teachers');
  let vaccine3 = await process('data/vaccine.csv', 'PRE:3. Sino sa mga sumusunod ang hindi kabilang sa mga pangalawang prayoridad (Priority Group B) sa pagkuha ng bakuna?','POST:3. Sino sa mga sumusunod ang hindi kabilang sa mga pangalawang prayoridad (Priority Group B) sa pagkuha ng bakuna?','estudyante');
  let vaccine4 = await process('data/vaccine.csv', 'PRE:4. Posible bang mag positibo pagkatapos ng bakuna?','POST:4. Posible bang mag positibo pagkatapos ng bakuna?','Hindi posibleng mag positibo sa mga viral test na sinabi');
  let vaccine5 = await process('data/vaccine.csv', 'PRE:5. Lahat ay side effects ng bakuna laban sa COVID-19 maliban sa alin sa mga sumusunod?','POST:5. Lahat ay side effects ng bakuna laban sa COVID-19 maliban sa alin sa mga sumusunod?','Pagkawala ng pang amoy');
  let vaccine6 = await process('data/vaccine.csv', 'PRE:6. Magkaka COVID-19 ba ang isang tao nang dahil sa pagkuha ng bakuna?','POST:6. Magkaka COVID-19 ba ang isang tao nang dahil sa pagkuha ng bakuna?','Hindi nakukuha ang COVID-19 dahil sa bakuna');
  let vaccine7 = await process('data/vaccine.csv', 'PRE:7. Nagdudulot ba ng autism ang mga bakuna?','POST:7. Nagdudulot ba ng autism ang mga bakuna?','Hindi, walang ebidensiya tungkol dito');
  let vaccine8 = await process('data/vaccine.csv', 'PRE:8. Alin sa mga sumusunod ang HINDI epekto ng pagkuha ng bakuna laban sa COVID-19?','POST:8. Alin sa mga sumusunod ang HINDI epekto ng pagkuha ng bakuna laban sa COVID-19?','Mas lumalala at tumatagal ang pandemyang sitwasyon natin ngayon');
  let vaccine9 = await process('data/vaccine.csv', 'PRE:9. Sino ang mga pwedeng makakuha ng bakuna?','POST:9. Sino ang mga pwedeng makakuha ng bakuna?','Lahat ay pwede, ngunit may prayoridad na kailangan sundin dahil sa limitadong suplay');
  let vaccine10 = await process('data/vaccine.csv', 'PRE:10. Kailangan pa ba magpabakuna kahit ang ibang mga tao ay nabakunahan na?','POST:10. Kailangan pa ba magpabakuna kahit ang ibang mga tao ay nabakunahan na?','Oo, upang maabot ang herd immunity kung saan kakaunti na lamang ang makakahawa at mahahawa sa sakit');
  let vaccine11 = await process('data/vaccine.csv', 'PRE:11. Ligtas ba ang bakuna laban sa COVID-19','POST:11. Ligtas ba ang bakuna laban sa COVID-19','Oo, napatunayan na ng madaming clinical trials na ligtas ito');
  let vaccine12 = await process('data/vaccine.csv', 'PRE:12. Magpopositibo ba ang isang tao sa viral test pagkatapos magpabakuna laban sa COVID-19?','POST:12. Magpopositibo ba ang isang tao sa viral test pagkatapos magpabakuna laban sa COVID-19?','Hindi, dahil ang PCR at antigen na viral test ay para sa kasalukuyang impeksyon lamang');
  let vaccine13 = await process('data/vaccine.csv', 'PRE:13. Ang mga bakuna ng mga kemikal na nakakasama sa katawan','POST:13. Ang mga bakuna ng mga kemikal na nakakasama sa katawan','Hindi, dahil ang lahat ng kemikal kasama sa bakuna ay napatunayang ligtas na gamitin');
  let vaccine14 = await process('data/vaccine.csv', 'PRE:14. Ang COVID-19 ay isang sakit na hindi maaaring labanan at patuloy na kakalat sa buong mundo','POST:14. Ang COVID-19 ay isang sakit na hindi maaaring labanan at patuloy na kakalat sa buong mundo','Mali, dahil kayang labanan ng mga bakuna ang COVID-19 gamit ang antibodies na dulot ng pagpabakuna');
  let vaccine15 = await process('data/vaccine.csv', 'PRE:15. Pabor ka bang magpabakuna','POST:15. Pabor ka bang magpabakuna','');
  write_csv('data/COVID1.csv', COVID1);
  write_csv('data/COVID2.csv', COVID2);
  write_csv('data/COVID3.csv', COVID3);
  write_csv('data/COVID4.csv', COVID4);
  write_csv('data/COVID5.csv', COVID5);
  write_csv('data/COVID6.csv', COVID6);
  write_csv('data/COVID7.csv', COVID7);
  write_csv('data/COVID8.csv', COVID8);
  write_csv('data/COVID9.csv', COVID9);
  write_csv('data/COVID10.csv', COVID10);
  write_csv('data/COVID11.csv', COVID11);
  write_csv('data/COVID12.csv', COVID12);
  write_csv('data/COVID13.csv', COVID13);
  write_csv('data/COVID14.csv', COVID14);
  write_csv('data/COVID15.csv', COVID15);
  write_csv('data/vaccine1.csv', vaccine1);
  write_csv('data/vaccine2.csv', vaccine2);
  write_csv('data/vaccine3.csv', vaccine3);
  write_csv('data/vaccine4.csv', vaccine4);
  write_csv('data/vaccine5.csv', vaccine5);
  write_csv('data/vaccine6.csv', vaccine6);
  write_csv('data/vaccine7.csv', vaccine7);
  write_csv('data/vaccine8.csv', vaccine8);
  write_csv('data/vaccine9.csv', vaccine9);
  write_csv('data/vaccine10.csv', vaccine10);
  write_csv('data/vaccine11.csv', vaccine11);
  write_csv('data/vaccine12.csv', vaccine12);
  write_csv('data/vaccine13.csv', vaccine13);
  write_csv('data/vaccine14.csv', vaccine14);
  write_csv('data/vaccine15.csv', vaccine15);
})();
