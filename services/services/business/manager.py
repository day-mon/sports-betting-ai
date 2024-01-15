import multiprocessing
from multiprocessing import Process, Event

from services.service import Service


class ServiceManager:
    processes: list[Process]
    stop_event: Event
    services: list[Service]

    @classmethod
    def from_services(cls, services: list[Service]):
        return cls(services)

    def __init__(self, services: list[Service]):
        self.services = services
        self.processes = []
        self.stop_event = Event()


    def start(self):
        for service in self.services:
            process = Process(target=service.start, args=(self.stop_event,))
            process.start()
            self.processes.append(process)

    def stop(self):
        self.stop_event.set()
        for process in self.processes:
            process.join()


    def restart(self):
        self.stop()
        self.start()

