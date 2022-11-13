import random

import tensorflow as tf
import keras as keras
import pandas as pd
import numpy as np
import keras
from typing import List, Tuple
from pandas import DataFrame
import openpyxl


class NNModelRun:
    def __init__(self, layers, nodes, epoch_count):
        self.layers = layers
        self.model = None
        self.fitness = 0.0
        self.nodes = nodes
        self.epoch_count = epoch_count

    def measure_fitness(self, data_out, data_in) -> float:
        if self.model is None:
            raise Exception("Model is not trained")


        print("data_out", data_out)
        print("data_in", data_in)



        # get width of data
        data_entries = len(data_in)

        print(f"Data entries: {data_entries}")
        expected_output = data_out['Home-Team-Win']

        predictions = self.model.predict(data_in)
        for i in range(0, data_entries):
            if expected_output[i] == np.argmax(predictions[i]):
                self.fitness += 1

        # return percentage of correct predictions

    def __str__(self):
        return f"Layers: {self.layers}, Nodes: {self.nodes}, Epochs: {self.epoch_count}, Fitness: {self.fitness}"


DESIRED_LAYERS = range(1, 10)
DESIRED_NODES = range(1, 30)
DESIRED_EPOCHS = range(1, 50)


def main():
    print("Num GPUs Available: ", len(tf.config.list_physical_devices('GPU')))
    desired_fitness = 100.0

    pop_size = 50
    mutation_perc = 0.01
    crossover_perc = 0.5
    generation = 0

    population = init_population(pop_size)
    new_population = []
    filtered_data, raw_data = get_data()

    while desired_fitness != get_best_fitness(population).fitness:
        for i in range(pop_size):
            nn_run = population[i]
            train_model(filtered_data, raw_data, nn_run)

            if nn_run.model is None:
                print("Model returned early")
                population.remove(nn_run)
                population.append(init_population(1)[0])
                continue

            print("Finished training model: ", nn_run)
            nn_run.measure_fitness(raw_data, filtered_data)
            print(f"Fitness: {nn_run.fitness}")

        for i in range(pop_size):
            parent_one = select_parents(population)
            parent_two = select_parents(population)

            if np.random.random() < crossover_perc:
                child_one, child_two = crossover(parent_one, parent_two)
                parent_one = child_one
                parent_two = child_two

            if np.random.random() < mutation_perc:
                parent_one = mutate(parent_one)

            if np.random.random() < mutation_perc:
                parent_two = mutate(parent_two)

            new_population.append(parent_one)
            new_population.append(parent_two)

        print(f"Generation: {generation}, Best Fitness: {get_best_fitness(population).fitness}")

        generation += 1
        population.clear()
        population = new_population
        new_population.clear()


def get_best_fitness(population: List[NNModelRun]) -> NNModelRun:
    best = None
    for nn_run in population:
        if best is None or nn_run.fitness > best.fitness:
            best = nn_run
    return best


def mutate(parent: NNModelRun) -> NNModelRun:
    parent.epoch_count = np.random.choice(DESIRED_EPOCHS)
    return parent


def crossover(parent_one: NNModelRun, parent_two: NNModelRun) -> (NNModelRun, NNModelRun):
    # crossover needs to be fixed
    crossover_point = random.randint(0, parent_one.layers - 1)
    child_one_one_layers = parent_one.layers[:crossover_point]
    child_one_two_layers = parent_two.layers[crossover_point:]

    child_two_one_layers = parent_two.layers[:crossover_point]
    child_two_two_layers = parent_one.layers[crossover_point:]

    child_one_layers = child_one_one_layers + child_one_two_layers
    child_two_layers = child_two_one_layers + child_two_two_layers

    parent_one.layers = child_one_layers
    parent_two.layers = child_two_layers

    temp = parent_one.epoch_count
    parent_one.epoch_count = parent_two.epoch_count
    parent_two.epoch_count = temp

    return parent_one, parent_two


def select_parents(population: List[NNModelRun]) -> NNModelRun:
    parent_pool_size = 10
    parent_pool = []
    for i in range(parent_pool_size):
        parent_pool.append(np.random.choice(population))

    best = None
    for nn_run in parent_pool:
        if best is None or nn_run.fitness > best.fitness:
            best = nn_run
    return best


def init_population(pop_size: int) -> List[NNModelRun]:
    population = []

    for i in range(pop_size):
        layers = np.random.choice(DESIRED_LAYERS)
        nodes = []
        for _ in range(layers):
            nodes.append(np.random.choice(DESIRED_NODES))

        epochs = np.random.choice(DESIRED_EPOCHS)
        population.append(NNModelRun(layers, nodes, epochs))
    return population


def train_model(
        filtered_data: DataFrame,
        raw_data: DataFrame,
        model_params: NNModelRun
):
    expected_output = raw_data['Home-Team-Win']
    data_input = filtered_data
    data_output = expected_output
    model = keras.Sequential()
    tf.keras.layers.Flatten(name="input_layer")
    for i in range(model_params.layers):
        model.add(tf.keras.layers.Dense(model_params.nodes[i], activation='relu'))
    model.add(tf.keras.layers.Dense(2, activation='softmax', name="output_layer"))
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    percent_of_epochs = int(model_params.epoch_count * 0.4)
    model.fit(data_input, data_output, epochs=model_params.epoch_count, callbacks=[
        tf.keras.callbacks.EarlyStopping(monitor='loss', patience=percent_of_epochs, restore_best_weights=True)])
    # check to see if the model returned early
    model_params.model = model if not len(model.history.history['loss']) < model_params.epoch_count else None


def get_data() -> (DataFrame, DataFrame):
    raw_data = pd.read_excel("Full-Data-Set-UnderOver-2020-21.xlsx")
    filtered_data = raw_data.drop(["Unnamed: 0"], axis=1)
    filtered_data = filtered_data.drop(["Score"], axis=1)
    filtered_data = filtered_data.drop(["GP"], axis=1)
    filtered_data = filtered_data.drop(["GP.1"], axis=1)
    filtered_data = filtered_data.drop(["Home-Team-Win"], axis=1)
    filtered_data = filtered_data.drop(["TEAM_NAME"], axis=1)
    filtered_data = filtered_data.drop(["Date"], axis=1)
    filtered_data = filtered_data.drop(["MIN"], axis=1)
    filtered_data = filtered_data.drop(["MIN.1"], axis=1)
    filtered_data = filtered_data.drop(["TEAM_NAME.1"], axis=1)
    filtered_data = filtered_data.drop(["Date.1"], axis=1)
    filtered_data = filtered_data.drop(["OU"], axis=1)
    filtered_data = filtered_data.drop(["OU-Cover"], axis=1)
    filtered_data = filtered_data.drop(["GP_RANK"], axis=1)
    filtered_data = filtered_data.drop(["GP_RANK.1"], axis=1)
    filtered_data = filtered_data.astype(float)
    return filtered_data, raw_data


if __name__ == '__main__':
    main()
