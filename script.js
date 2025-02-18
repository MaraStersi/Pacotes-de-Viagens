function calcularTotal() {
    var quantidade = document.getElementById('quantidade').value;
    var preco = 5000;  // Substitua com o preço do pacote
    var total = preco * quantidade;
    document.getElementById('total').innerText = total;
}
