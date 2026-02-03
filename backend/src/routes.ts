
import { Router } from "express";
import multer from 'multer';
import { CreateUserController } from "./controllers/user/createUserController";
import { AuthUserController } from "./controllers/user/AuthUSerController";
import { DetailUserController } from "./controllers/user/DetailUserController";
import { isAuthenticated } from "./middlewares/isAuthenticated";
import { CreateCategoryController } from "./controllers/category/CreateCategoryController";
import { CategoryListController } from "./controllers/category/CategoryListController";
import { ProdutsCreateController } from "./controllers/produts/ProdutsCreateController";
import { ListByCategoryController } from "./controllers/produts/ListByCategoryController";
import uploadConfig from './config/multer'
import { OrderController } from "./controllers/order/OrderController";
import { DeleteOrderController } from "./controllers/order/DeleteOrderController";
import { AddListOrderController } from "./controllers/order/AddListOrderController";
import { RemoveItemController } from "./controllers/order/RemoveItemController";
import { SendOrderController } from "./controllers/order/SendOrderController";
import { ListOrdersController } from "./controllers/order/ListOrdersController";
import { DetailOrderController } from "./controllers/order/DetailOrderController";
import { FinishOrderController } from "./controllers/order/FinishOrderController";
import { OrganizationController } from "./controllers/organization/OrganizationController";
import { ListAllprodutsController } from "./controllers/produts/listAllProduts";
import { UserController } from "./controllers/user/ListandUpadate_deleteUserController";
import { StockController } from "./controllers/stock/StockController";
import { CompraController } from "./controllers/compra/CompraController";
import { CompraProdutoController } from "./controllers/compra_produts/compraProdutsController";
import { MesaController } from "./controllers/mesa/mesaController";
import { RecipeController } from "./controllers/receita/receitaController";
import { OrderSendController } from "./controllers/order/OderSendController";

import { getDashboardReport } from "./services/organization/dashboardService";
import { DashboardController } from "./controllers/dashboard/controller";
import { FaturaController } from "./controllers/fatura/faturaController";
//import { FaturaController } 

const router = Router();

const upload = multer(uploadConfig.upload("./tmp"));

const createUserController = new CreateUserController();
const userController = new UserController();
const Authcontroller = new AuthUserController();
const DetailController = new DetailUserController();
const CreateCategoryContoller = new CreateCategoryController()
const categoryListController = new CategoryListController();
const produCreateController = new ProdutsCreateController();
const listByCategoryController = new ListByCategoryController();
const listAllProdutsController = new ListAllprodutsController();
const orderController = new OrderController();
const deleteOrderController = new DeleteOrderController();
const addListOrderController = new AddListOrderController();
const removeItemController = new RemoveItemController();
const sendOrderController = new SendOrderController();
const listOrdersController = new ListOrdersController();
const detailOrderController = new DetailOrderController();
const finishOrderController = new FinishOrderController();
const organizationController = new OrganizationController();
const stockController = new StockController();
const compra = new CompraController();
const compraProdut = new CompraProdutoController();
const mesaController = new MesaController();
const controller = new RecipeController();
const OrderSend = new OrderSendController();
const DashboardContro = new DashboardController();
const faturaController = new FaturaController();

// Áreas
import {
  CriarAreaController,
  ListarAreasController,
  ObterAreaController,
  AtualizarAreaController,
  DeletarAreaController,
  InicializarAreasPadraoController
} from "./controllers/areas/areaController";

import {
  AdicionarProdutoController,
  ListarStockAreaController,
  AjustarStockController,
  ObterAlertasStockController,
  ObterStockProdutoController,
  RemoverProdutoController,
  AtualizarConfigEconomatoController,
  TransferirProdutoController
} from "./controllers/areas/EconomatoController";

import {
  CriarPedidoAreaController,
  ListarPedidosAreaController,
  ObterPedidoAreaController,
  ProcessarPedidoAreaController,
  ConfirmarPedidoAreaController
} from "./controllers/areas/PedidoAreaController";
import { AtualizarConsumoInternoController, DashboardConsumoController, DeletarConsumoInternoController, ListarConsumosInternoController, ObterConsumoInternoController, RegistrarConsumoInternoController, RelatorioConsumoPorAreaController } from "./controllers/areas/ConsumoInternoController";

// Instanciar Controllers de Área
const criarAreaController = new CriarAreaController();
const listarAreasController = new ListarAreasController();
const obterAreaController = new ObterAreaController();
const atualizarAreaController = new AtualizarAreaController();
const deletarAreaController = new DeletarAreaController();
const inicializarAreasController = new InicializarAreasPadraoController();

// Instanciar Controllers de Economato
const adicionarProdutoEconomatoController = new AdicionarProdutoController();
const listarStockAreaController = new ListarStockAreaController();
const ajustarStockController = new AjustarStockController();
const alertsStockController = new ObterAlertasStockController();
const stockProdutoController = new ObterStockProdutoController();
const removerProdutoEconomatoController = new RemoverProdutoController();
const atualizarConfigEconomatoController = new AtualizarConfigEconomatoController();
const transferirProdutoController = new TransferirProdutoController();

// Instanciar Controllers de Pedidos (Add Confirmar)
const criarPedidoAreaController = new CriarPedidoAreaController();
const listarPedidosAreaController = new ListarPedidosAreaController();
const obterPedidoAreaController = new ObterPedidoAreaController();
const processarPedidoAreaController = new ProcessarPedidoAreaController();
const confirmarPedidoAreaController = new ConfirmarPedidoAreaController();

// Instanciar Controllers de Consumo
const registrarConsumoController = new RegistrarConsumoInternoController();
const listarConsumosController = new ListarConsumosInternoController();
const relatorioConsumoController = new RelatorioConsumoPorAreaController();
const obterConsumoController = new ObterConsumoInternoController();
const atualizarConsumoController = new AtualizarConsumoInternoController();
const deletarConsumoController = new DeletarConsumoInternoController();
const dashboardConsumoController = new DashboardConsumoController();

// ROTAS DE ÁREAS
router.post('/areas', isAuthenticated, criarAreaController.handle);
router.get('/areas', isAuthenticated, listarAreasController.handle);
router.get('/areas/:id', isAuthenticated, obterAreaController.handle);
router.put('/areas/:id', isAuthenticated, atualizarAreaController.handle);
router.delete('/areas/:id', isAuthenticated, deletarAreaController.handle);
router.post('/areas/init-defaults', isAuthenticated, inicializarAreasController.handle);

// ROTAS DE ECONOMATO (STOCK POR ÁREA)
router.post('/economato/add', isAuthenticated, adicionarProdutoEconomatoController.handle);
router.get('/economato/area/:areaId', isAuthenticated, listarStockAreaController.handle);
router.put('/economato/ajuste', isAuthenticated, ajustarStockController.handle);
router.get('/economato/alertas', isAuthenticated, alertsStockController.handle);
router.get('/economato/produto/:productId', isAuthenticated, stockProdutoController.handle);
router.post('/economato/remove', isAuthenticated, removerProdutoEconomatoController.handle);
router.put('/economato/config', isAuthenticated, atualizarConfigEconomatoController.handle);
router.post('/economato/transferir', isAuthenticated, transferirProdutoController.handle);

// ROTAS DE PEDIDOS DE TRANSFERÊNCIA
router.post('/pedidos-area', isAuthenticated, criarPedidoAreaController.handle);
router.get('/pedidos-area', isAuthenticated, listarPedidosAreaController.handle);
router.get('/pedidos-area/:id', isAuthenticated, obterPedidoAreaController.handle);
router.put('/pedidos-area/:id/processar', isAuthenticated, processarPedidoAreaController.handle);
router.post('/pedidos-area/:id/confirmar', isAuthenticated, confirmarPedidoAreaController.handle);

// ROTAS DE CONSUMO INTERNO
router.post('/consumo-interno', isAuthenticated, registrarConsumoController.handle);
router.get('/consumo-interno', isAuthenticated, listarConsumosController.handle);
router.get('/consumo-interno/dashboard', isAuthenticated, dashboardConsumoController.handle);
router.get('/consumo-interno/relatorio', isAuthenticated, relatorioConsumoController.handle);
router.get('/consumo-interno/:id', isAuthenticated, obterConsumoController.handle);
router.put('/consumo-interno/:id', isAuthenticated, atualizarConsumoController.handle);
router.delete('/consumo-interno/:id', isAuthenticated, deletarConsumoController.handle);

//Routas USER
router.post('/users', createUserController.hadle)
router.get('/users', isAuthenticated, userController.listUsers)
router.get('/all_users', isAuthenticated, userController.listAllUsers)
router.get('/user', isAuthenticated, userController.UserById)
router.put('/user', isAuthenticated, userController.updateUser)
router.delete('/user', isAuthenticated, userController.deleteUser)


router.post('/session', Authcontroller.handle)
router.get('/me', isAuthenticated, DetailController.handle)

//ROUTAS CATEGORY
router.post('/category', isAuthenticated, CreateCategoryContoller.handdle)
router.get('/category', categoryListController.handdle)
router.put('/category', isAuthenticated, CreateCategoryContoller.updateCategory)
router.delete('/category', isAuthenticated, CreateCategoryContoller.deleteCategory)

//Routas Produtos 
router.post('/produts', isAuthenticated, upload.single('file'), produCreateController.handle)
router.get('/category/produts', listByCategoryController.handdle)
router.get('/produts', listAllProdutsController.handdle)
router.delete('/produt', isAuthenticated, produCreateController.deleteProduct)
router.put('/produt', isAuthenticated, upload.single('file'), produCreateController.updateProduct)
router.get('/produt', isAuthenticated, listByCategoryController.getProdById)


//ROUTAS ORDER
router.post('/orderQr', orderController.handdle);
router.post('/order', isAuthenticated, orderController.handdle);
router.post('/orders/with-stock', OrderSend.createWithStockUpdate);
router.post('/token/verify', OrderSend.ChekVerify);
router.get('/mesa_verify/:number', isAuthenticated, orderController.verify);
router.delete('/order', deleteOrderController.handdle);
router.post('/order/add', addListOrderController.handdle);
router.delete('/order/remove', removeItemController.handdle);
router.put('/order/send', isAuthenticated, sendOrderController.handdle);
router.get('/orders', isAuthenticated, listOrdersController.handdle);
router.put('/items/:itemId/toggle-prepared', isAuthenticated, listOrdersController.togglePrepared);
router.get('/sec_fact', isAuthenticated, listOrdersController.getFaturaSessionId);
router.get('/close_table/:number', isAuthenticated, listOrdersController.fecharMesa);
router.get('/ordersdat', isAuthenticated, listOrdersController.ListOrderByData);
router.get('/order/details', isAuthenticated, detailOrderController.handdle);
router.put('/order/finish', isAuthenticated, finishOrderController.handdle);


//Organização
router.post('/organization', organizationController.create)
router.delete('/organization', isAuthenticated, organizationController.delete)
router.put('/organization/:id', isAuthenticated, upload.single('imageLogo'), organizationController.update)
router.get('/organization', isAuthenticated, organizationController.findById)
router.get('/organizations', isAuthenticated, organizationController.findByAll)
//Stock

router.post('/stock', isAuthenticated, stockController.addProductToStock)
router.post('/stock_remuv', isAuthenticated, stockController.RemovProductToStock)
router.get('/stock', isAuthenticated, stockController.AllSockByOrganization)
router.get('/stock_category', isAuthenticated, stockController.AllSockByCategory)
router.get('/stockQr', stockController.AllSockByOrganization)
router.get('/stock_categoryQr', stockController.AllSockByCategory)
router.put('/price', isAuthenticated, stockController.ConfirmPreco)
router.put('/price/custom', isAuthenticated, stockController.updateCustomPrice)

// compras
router.post('/compra', isAuthenticated, compra.handdle)
router.delete('/compra', isAuthenticated, compra.Delete)
router.delete('/compra_produt', isAuthenticated, compraProdut.Delete)
router.delete('/remuvProdcompra', isAuthenticated, compraProdut.RemuvProdu)
router.post('/compra_produt', isAuthenticated, compraProdut.handdle)
router.get('/produts_list_compra', isAuthenticated, compraProdut.ListaByCompra)
router.get('/compra', isAuthenticated, compra.GetAll)

//mesa

router.post('/mesa', isAuthenticated, mesaController.Create);
router.get('/mesaOpened/:organizationId', isAuthenticated, mesaController.getMesaOpened);
router.get('/mesas', isAuthenticated, mesaController.getMesas);
router.put('/sectionOf', isAuthenticated, mesaController.fecharSessao);
router.delete('/mesa/:id',isAuthenticated, mesaController.delete);


//Receitas
router.post("/recipe", isAuthenticated, controller.addIngredient);
router.get('/recipe/:productId', isAuthenticated, controller.listRecipe);
router.put("/recipe", isAuthenticated, controller.upsertIngredient);
router.delete("/recipe/:id", isAuthenticated, controller.removeIngredient);
router.get('/dash/:organizationId', isAuthenticated, DashboardContro.getDashboardData);

//Facturas

router.get('/faturas', faturaController.getFaturas);
router.get('/faturas/:id', faturaController.getFatura);
router.post('/faturas/:id/pagamento', isAuthenticated, faturaController.processarPagamento);
router.post('/faturas/:id/cancelar', isAuthenticated, faturaController.cancelarFatura);
router.get('/estatisticas/vendas', faturaController.getEstatisticas);

export { router }