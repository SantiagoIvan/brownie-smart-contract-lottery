from brownie import Lottery, config, network
from scripts.utils import (
    LOCAL_BLOCKCHAIN_ENVIROMENTS,
    TICKET_VALUE,
    deploy_mocks,
    fund_with_link,
    get_account,
    get_contract,
)
import time


def deploy_lottery():
    account = get_account()
    lottery = Lottery.deploy(
        get_contract("eth_usd_price_feed").address,
        get_contract("vrf_coordinator").address,
        get_contract("link_token").address,
        config["networks"][network.show_active()]["fee"],
        config["networks"][network.show_active()]["keyhash"],
        TICKET_VALUE,
        {"from": account},
        publish_source=config["networks"][network.show_active()]["verify"],
    )
    return lottery


def start_lottery():
    account = get_account()
    lottery = Lottery[-1]

    starting_lottery = lottery.startLottery({"from": account})
    starting_lottery.wait(1)  # si es que no llega a printearse lo de abajo.
    print("Lottery started!")


def enter_lottery():
    account1 = get_account()
    lottery = Lottery[-1]

    amount = lottery.getEntranceFee()
    tx = lottery.enterLottery({"from": account1, "value": amount})
    tx.wait(1)
    print("Entered Lottery")

    # account2 = get_account(index=1)
    # tx = lottery.enterLottery({"from": account2, "value": amount})
    # tx.wait(1)
    # print("Entered Lottery")

    # players = lottery.getPlayersCount()
    # print(f"Players: {players}")


def end_lottery():
    account = get_account()
    lottery = Lottery[-1]

    # Para que nuestro contrato pueda pedir el numero random a chainlink, tiene que tener fondos para gastar(Link gas)
    tx = fund_with_link(lottery.address)
    tx.wait(1)
    tx = lottery.endLottery({"from": account})
    tx.wait(1)
    time.sleep(60)
    winner = lottery.lastWinner()
    print(f"Lottery ended. The winner is {winner}")


def main():
    deploy_lottery()


# en ganache-local, el ganador es el 0x0 justamente porque no hay un nodo de chainlink que responda
# la request y dispare la funcion fulfillRandomness

# en mainnet-fork no puedo darle fondos al contrato
