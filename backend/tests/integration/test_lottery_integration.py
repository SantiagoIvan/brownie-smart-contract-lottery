from brownie import Lottery, network, Contract, config, VRFCoordinatorMock
from scripts.utils import (
    LOCAL_BLOCKCHAIN_ENVIROMENTS,
    TICKET_VALUE,
    get_contract,
    get_account,
    fund_with_link,
)
from scripts.deploy_lottery import deploy_lottery
import pytest
import time

# Test en Rinkeby
def test_deploy_on_rinkeby_succesful():
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIROMENTS:
        pytest.skip()
    account = get_account()
    lottery = Lottery[-1] if Lottery[-1] else deploy_lottery()

    assert len(Lottery) == 1
    assert lottery.owner() == account.address


def test_lottery_pick_a_winner_succesfully():
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIROMENTS:
        pytest.skip()
    lottery = Lottery[-1] if len(Lottery) else deploy_lottery()

    account = get_account()
    amount = lottery.getEntranceFee()

    lottery.startLottery({"from": account})
    lottery.enterLottery({"from": account, "value": amount})
    players_count = lottery.getPlayersCount()
    prev_balance = account.balance()
    # Necesito financiar con links al contrato
    fund_with_link(lottery.address)
    tx = lottery.endLottery({"from": account})
    tx.wait(14)  # 12 blocks confirmados aprox, lo saque de etherscan

    assert lottery.balance() == 0
    assert lottery.lastWinner() == account.address
    assert lottery.lastRandom() > 0
