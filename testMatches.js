const text =
  "this is the small: [{'periodo': 'Janeiro/2022', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Fevereiro/2022', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Março/2022', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Abril/2022', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Maio/2022', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Junho/2022', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Julho/2022', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Agosto/2022', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Setembro/2022', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Outubro/2022', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Novembro/2022', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Dezembro/2022', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}]this is the small: [{'periodo': 'Janeiro/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Fevereiro/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Março/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': '-', 'apurado': '-', 'beneficio_inss': '-', 'situacao': '-'}, {'periodo': 'Abril/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': '-', 'apurado': '-', 'beneficio_inss': '-', 'situacao': '-'}, {'periodo': 'Maio/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': '-', 'apurado': '-', 'beneficio_inss': '-', 'situacao': '-'}, {'periodo': 'Junho/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Julho/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Agosto/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Setembro/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Outubro/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Novembro/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Dezembro/2021', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': 'R$ 60,00'}]this is the small: [{'periodo': 'Janeiro/2020', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Fevereiro/2020', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Março/2020', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Abril/2020', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Maio/2020', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Junho/2020', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Julho/2020', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Agosto/2020', 'apurado': 'Não', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Setembro/2020', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Outubro/2020', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Novembro/2020', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': '-'}, {'periodo': 'Dezembro/2020', 'apurado': 'Sim', 'beneficio_inss': '', 'situacao': '-'}]this is the small: Não optanteO usuário foi não optante nesse ano.";
const matches = text.match(/\[(.*?)\]/g);
console.log("MATCHES 0: ");
console.log(matches[0]);
console.log("MATCHES 1: ");
console.log(matches[1]);
console.log("MATCHES 2: ");
console.log(matches[2]);
