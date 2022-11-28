# Import Dependencies

import tensorflow as tf
import pandas as pd
import numpy as np
import keras


print("Num GPUs Available: ", len(tf.config.list_physical_devices('GPU')))
print("Num TPUs Available: ", len(tf.config.list_physical_devices('TPU')))

"""# Read in the Data """


rawData = pd.read_excel("Full-Data-Set-UnderOver-2020-21.xlsx")
rawData = rawData.sample(frac=1) #randomize the arrangement of rawData


rawData.describe()


"""## Filter the data / Remove older seasons

## Clean the Data
"""


filteredData = rawData.drop(["Unnamed: 0"], axis = 1)
filteredData = filteredData.drop(["Score"], axis = 1)
filteredData = filteredData.drop(["GP"], axis = 1)
filteredData = filteredData.drop(["GP.1"], axis = 1)
filteredData = filteredData.drop(["Home-Team-Win"], axis = 1)
filteredData = filteredData.drop(["TEAM_NAME"], axis = 1)
filteredData = filteredData.drop(["Date"], axis = 1)
filteredData = filteredData.drop(["MIN"], axis = 1)
filteredData = filteredData.drop(["MIN.1"], axis = 1)
filteredData = filteredData.drop(["TEAM_NAME.1"], axis = 1)
filteredData = filteredData.drop(["Date.1"], axis = 1)
filteredData = filteredData.drop(["OU"], axis = 1)
filteredData = filteredData.drop(["OU-Cover"], axis = 1)
filteredData = filteredData.drop(["GP_RANK"], axis = 1)
filteredData = filteredData.drop(["GP_RANK.1"], axis = 1)


filteredData = filteredData.astype(float)
type(filteredData)


filteredData.head()

"""# Train the Model

#### Get the outputs
"""

output = rawData['Home-Team-Win']


#get 80% for training 20% for testing
print(len(filteredData))
test_len = int(len(filteredData) * 0.8)
x_train = filteredData.take(range(test_len))
x_test = filteredData.take(range(test_len, len(filteredData)))
y_train = output.take(range(test_len))
y_test = output.take(range(test_len, len(filteredData)))


model = keras.Sequential()


model.add( tf.keras.layers.Dense(2048, activation='relu', name='input_layer'))
model.add( tf.keras.layers.Dense(1024, activation='relu'))
model.add( tf.keras.layers.Dense(512, activation='relu'))
model.add( tf.keras.layers.Dense(256, activation='relu'))
model.add( tf.keras.layers.Dense(
    512, input_dim=512,
    kernel_initializer='ones',
    kernel_regularizer=tf.keras.regularizers.L1(0.0001),
    activity_regularizer=tf.keras.regularizers.L2(0.0001)) )

model.add( tf.keras.layers.Dense(512, activation='relu'))
model.add( tf.keras.layers.Dense(1024, activation='relu'))
model.add( tf.keras.layers.Dense(2, activation='softmax', name='output_layer'))


model.build( x_train.shape )
model.summary()


layer_names=[layer.name for layer in model.layers]
print(layer_names)


model.compile( optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'] )


import random
model.fit(x_train, y_train, epochs=500, batch_size=random.randint(2000,5000))


predictions = model.predict([x_test])


"""# Save the Model"""
model.save('model')