let entry = `[{'periodo': 'Janeiro/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': 'Liquidado'}, {'periodo': 'Fevereiro/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': 'Liquidado'}, {'periodo': 'Março/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': 'Liquidado\n \n1ª Quota'}, {'periodo': '-', 'apurado': '-', 'beneficio_inss': '-', 'situacao': '-'}, {'periodo': 'Abril/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': 'Liquidado\n \n1ª Quota'}, {'periodo': '-', 'apurado': '-', 'beneficio_inss': '-', 'situacao': '-'}, {'periodo': 'Maio/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': 'Liquidado\n \n1ª Quota'}, {'periodo': '-', 'apurado': '-', 'beneficio_inss': '-', 'situacao': '-'}, {'periodo': 'Junho/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': 'A Vencer'}, {'periodo': 'Julho/2021', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': 'Não Disponível'}, {'periodo': 'Agosto/2021', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': 'Não Disponível'}, {'periodo': 'Setembro/2021', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': 'Não Disponível'}, {'periodo': 'Outubro/2021', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': 'Não Disponível'}, {'periodo': 'Novembro/2021', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': 'Não Disponível'}, {'periodo': 'Dezembro/2021', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': 'Não Disponível'}]`;
let replaced = entry.replace(/'/g, '"').replace(/\s/g, '')
let result = JSON.parse(replaced);
console.log("done");