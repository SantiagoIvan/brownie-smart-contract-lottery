from brownie import Lottery, exceptions, network
from scripts.utils import (
    LOCAL_BLOCKCHAIN_ENVIROMENTS,
    get_contract,
    get_account,
    fund_with_link,
)
from scripts.deploy_lottery import deploy_lottery
import pytest

"""
Con estos tests unitarios busco probar cada funcionalidad del contrato.
En los test de integracion probare en otra red que no sea local
"""


def test_creator_is_the_owner_of_lottery():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIROMENTS:
        pytest.skip()

    account = get_account()

    lottery = deploy_lottery()

    assert lottery.owner() == account.address


def test_lottery_is_closed_when_deployed():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIROMENTS:
        pytest.skip()
    account = get_account()
    lottery = deploy_lottery()
    with pytest.raises(exceptions.VirtualMachineError):
        lottery.enterLottery({"from": account})


def test_owner_opens_lottery_successfully():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIROMENTS:
        pytest.skip()
    account = get_account()
    lottery = deploy_lottery()

    tx = lottery.startLottery({"from": account})
    tx.wait(1)

    assert lottery.state() == 0


def test_random_user_tries_startLottery_but_raises_error():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIROMENTS:
        pytest.skip()
    lottery = deploy_lottery()
    random_user = get_account(index=1)

    with pytest.raises(exceptions.VirtualMachineError):
        lottery.startLottery({"from": random_user})


def test_player_without_eth_tries_enterLottery_but_raises_error():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIROMENTS:
        pytest.skip()
    lottery = deploy_lottery()
    account = get_account()

    lottery.startLottery({"from": account})

    with pytest.raises(exceptions.VirtualMachineError):
        lottery.enterLottery({"from": account})


def test_a_bunch_of_players_entered_successfully_to_the_lottery():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIROMENTS:
        pytest.skip()
    lottery = deploy_lottery()
    account0 = get_account(index=0)
    account1 = get_account(index=1)
    account2 = get_account(index=2)
    account3 = get_account(index=3)
    amount = lottery.getEntranceFee()

    tx = lottery.startLottery({"from": account0})
    tx.wait(1)
    tx = lottery.enterLottery({"from": account0, "value": amount})
    tx.wait(1)
    tx = lottery.enterLottery({"from": account1, "value": amount})
    tx.wait(1)
    tx = lottery.enterLottery({"from": account2, "value": amount})
    tx.wait(1)
    tx = lottery.enterLottery({"from": account3, "value": amount})
    tx.wait(1)

    assert lottery.getPlayersCount() == 4


def test_random_user_tries_endLottery_but_raises_error():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIROMENTS:
        pytest.skip()
    lottery = deploy_lottery()
    account0 = get_account(index=0)
    random_user = get_account(index=1)
    amount = lottery.getEntranceFee()

    lottery.startLottery({"from": account0})
    lottery.enterLottery({"from": random_user, "value": amount})

    with pytest.raises(exceptions.VirtualMachineError):
        lottery.endLottery({"from": random_user})


def test_lottery_ends_successfully():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIROMENTS:
        pytest.skip()
    lottery = deploy_lottery()
    account = get_account()
    amount = lottery.getEntranceFee()

    lottery.startLottery({"from": account})
    lottery.enterLottery({"from": account, "value": amount})
    # Necesito financiar con links al contrato
    fund_with_link(lottery.address)
    lottery.endLottery({"from": account})

    assert (
        lottery.state() == 2
    )  # calculating winner, falta probar la seleccion del ganador(con el random)


# este podria ser un integration test tranquilamente pero bueno lo estoy probando en local asi que
# lo dejo aca
def test_lottery_pick_a_winner_succesfully():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIROMENTS:
        pytest.skip()

    lottery = deploy_lottery()
    account = get_account()
    amount = lottery.getEntranceFee()

    lottery.startLottery({"from": account})
    lottery.enterLottery({"from": account, "value": amount})
    lottery.enterLottery({"from": get_account(index=1), "value": amount})
    lottery.enterLottery({"from": get_account(index=2), "value": amount})
    prev_balance = account.balance()
    players_count = lottery.getPlayersCount()
    # Necesito financiar con links al contrato
    fund_with_link(lottery.address)
    tx = lottery.endLottery({"from": account})
    requestId = tx.events["RequestedRandomness"]["requestId"]

    # ahora puedo usar ese request Id para hacer de Chainlink Node y disparar el callbackFulfillRandomness
    # como bien escribi en el archivo Guia.txt.
    # Esta es una forma de mockear las respuestas de chainlink Node
    random_number = 3
    get_contract("vrf_coordinator").callBackWithRandomness(
        requestId, random_number, lottery.address, {"from": account}
    )
    # players.length = 3, por lo tanto 3 % 3 = 0, el ganador es el admin
    winner = lottery.lastWinner()

    assert lottery.lastRandom() == random_number
    assert (
        winner == get_account(index=(random_number % players_count)).address
    )  # gano el admin que mentira
    assert lottery.balance() == 0
    assert (
        account.balance() == prev_balance + amount * players_count
    )  # *3 porque es la cantidad total de jugadores que hubo
