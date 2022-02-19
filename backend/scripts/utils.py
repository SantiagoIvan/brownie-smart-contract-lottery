from brownie import (
    accounts,
    network,
    MockV3Aggregator,
    LinkToken,
    VRFCoordinatorMock,
    config,
    Contract,
)

TICKET_VALUE = 50
LOCAL_BLOCKCHAIN_ENVIROMENTS = ["development", "ganache-local"]
FORKED_LOCAL_ENVIROMENTS = ["mainnet-fork"]
DECIMALS = 8  # lo saco de chainlink v3  aggregator
INITIAL_VALUE = 200000000000

contract_to_mock = {
    "link_token": LinkToken,
    "eth_usd_price_feed": MockV3Aggregator,
    "vrf_coordinator": VRFCoordinatorMock,
}


def get_account(
    index=None, id=None
):  # para hacerlo mas generico y poder obtener cualquier cuenta por el metodo que sea
    if index:
        return accounts[index]
    if id:
        return accounts.load(id)
    if (
        network.show_active() in LOCAL_BLOCKCHAIN_ENVIROMENTS
        or network.show_active() in FORKED_LOCAL_ENVIROMENTS
    ):
        return accounts[0]
    return accounts.load("santu-account")


def get_contract(contract_name):
    """
    https://github.com/smartcontractkit/chainlink-mix/blob/master/scripts/helpful_scripts.py

    Esta funcion va a tomar la direccion del config si estan definidas, para la red en la que estoy actualmente.
    Esto es porque si estoy en ganache local, no voy a tener definidas esas direcciones, por lo que voy
    a tener que deployar los mocks.
    Esto me va a permitir obtener la direccion de un contrato, y si estoy en local, voy a deployar el mock
    y luego retornar la direccion

    Argumento:
        - contract_name

    Return:
        - brownie.network.contract.ProjectContrat. La version mas reciente deployada
        es decir, Mock[-1] por ejemplo si es que nunca se habia deployado y sino lo deployo y lo envio
        O puede ser un contrato REAL en una red. Me permite ambas cosas
    """
    contract_type = contract_to_mock[contract_name]
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIROMENTS:
        # chequeamos si esta deployado ya.
        # Si no esta deployado los deployamos todos
        if len(contract_type) <= 0:
            deploy_mocks()
        contract = contract_type[-1]
    else:
        contract_address = config["networks"][network.show_active()][contract_name]
        contract = Contract.from_abi(
            contract_type._name, contract_address, contract_type.abi
        )

    return contract


def deploy_mocks():
    account = get_account()

    MockV3Aggregator.deploy(DECIMALS, INITIAL_VALUE, {"from": account})

    link_token = LinkToken.deploy({"from": account})

    VRFCoordinatorMock.deploy(link_token.address, {"from": account})

    print("Mocks deployed!")


def fund_with_link(
    contract_address, account=None, link_token=None, amount=100000000000000000
):  # 0.1 LINK
    print("Funding contract...")
    account = account if account else get_account()
    link_token = link_token if link_token else get_contract("link_token")
    tx = link_token.transfer(contract_address, amount, {"from": account})
    tx.wait(1)
    print("Contract funded!")
    return tx
