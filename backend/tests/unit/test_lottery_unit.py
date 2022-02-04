from random import random
from brownie import Lottery, exceptions
from scripts.utils import get_contract, get_account
from scripts.deploy_lottery import deploy_lottery
import pytest


def test_creator_is_the_owner_of_lottery():
    account = get_account()

    lottery = deploy_lottery()

    assert lottery.owner() == account.address


def test_lottery_is_closed_when_deployed():
    account = get_account()
    lottery = deploy_lottery()
    with pytest.raises(exceptions.VirtualMachineError):
        lottery.enterLottery({"from": account})


def test_owner_opens_lottery_successfully():
    account = get_account()
    lottery = deploy_lottery()

    tx = lottery.startLottery({"from": account})
    tx.wait(1)

    assert lottery.state() == 0


def test_random_user_tries_startLottery_but_raises_error():
    lottery = deploy_lottery()
    random_user = get_account(index=1)

    with pytest.raises(exceptions.VirtualMachineError):
        lottery.startLottery({"from": random_user})


def test_player_without_eth_tries_enterLottery_but_raises_error():
    lottery = deploy_lottery()
    account = get_account()

    lottery.startLottery({"from": account})

    with pytest.raises(exceptions.VirtualMachineError):
        lottery.enterLottery({"from": account})


def test_a_bunch_of_players_entered_successfully_to_the_lottery():
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
    lottery = deploy_lottery()
    account0 = get_account(index=0)
    random_user = get_account(index=1)
    amount = lottery.getEntranceFee()

    lottery.startLottery({"from": account0})
    lottery.enterLottery({"from": random_user, "value": amount})

    with pytest.raises(exceptions.VirtualMachineError):
        lottery.endLottery({"from": random_user})
