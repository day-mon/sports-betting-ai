#!/usr/bin/env python
# coding: utf-8

# # Import Dependenciesg

# In[1]:


import os

import tensorflow as tf
import pandas as pd
import keras


# In[ ]:


keras.__version__


# In[ ]:


tf.__version__


# In[ ]:


print("Num GPUs Available: ", len(tf.config.list_physical_devices('GPU')))


# # Read in the Data 

# In[ ]:


rawData = pd.read_excel("Full-Data-Set-UnderOver-2020-21.xlsx")
rawData = rawData.sample(frac=1)


# In[ ]:


rawData.describe()


# ## Clean the Data

# In[ ]:


filteredData = rawData.drop(["Unnamed: 0"], axis = 1)
filteredData = filteredData.drop(["Score"], axis = 1)
filteredData = filteredData.drop(["GP"], axis = 1)
filteredData = filteredData.drop(["GP.1"], axis = 1)
filteredData = filteredData.drop(["Home-Team-Win"], axis = 1)
filteredData = filteredData.drop(["TEAM_NAME"], axis = 1)
filteredData = filteredData.drop(["Date"], axis = 1)
filteredData = filteredData.drop(["MIN", "W", "W.1", "L", "L.1", "PLUS_MINUS", "PLUS_MINUS.1", "PLUS_MINUS_RANK", "PLUS_MINUS_RANK.1", "W_RANK", "W_RANK.1", "L_RANK", "L_RANK.1"], axis = 1)
filteredData = filteredData.drop(["MIN.1"], axis = 1)
filteredData = filteredData.drop(["MIN_RANK.1"], axis = 1)
filteredData = filteredData.drop(["MIN_RANK"], axis = 1)
filteredData = filteredData.drop(["TEAM_NAME.1"], axis = 1)
filteredData = filteredData.drop(["Date.1"], axis = 1)
filteredData = filteredData.drop(["OU"], axis = 1)
filteredData = filteredData.drop(["OU-Cover"], axis = 1)
filteredData = filteredData.drop(["GP_RANK"], axis = 1)
filteredData = filteredData.drop(["GP_RANK.1"], axis = 1)


# # Train the Model

# #### Get the outputs

# In[ ]:


output = rawData['Home-Team-Win']


# In[ ]:


#get 80% for training 20% for testing
print(len(filteredData))
test_len = int(len(filteredData) * 0.8)
x_train = filteredData.take(range(test_len))
x_test = filteredData.take(range(test_len, len(filteredData)))
y_train = output.take(range(test_len))
y_test = output.take(range(test_len, len(filteredData)))
print(y_train.shape)
print(y_test[0].shape)
print(y_test.shape)


# In[ ]:


test_len = int(len(filteredData) * 0.9)
x_train = filteredData.take(range(test_len))
x_test = filteredData.take(range(test_len, len(filteredData)))
y_train = output.take(range(test_len))
y_test = output.take(range(test_len, len(filteredData)))


# In[ ]:


import datetime
get_ipython().run_line_magic('load_ext', 'tensorboard')
log_dir = "logs/fit/" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
tensorboard_callback = tf.keras.callbacks.TensorBoard(log_dir=log_dir, histogram_freq=1)


# In[ ]:


model = tf.keras.models.Sequential()
model.add(tf.keras.layers.Flatten())
model.add(tf.keras.layers.Dense(170, activation=tf.nn.relu6))
model.add(tf.keras.layers.Dropout(rate=.25))
model.add(tf.keras.layers.Dense(150, activation=tf.nn.relu6))
model.add(tf.keras.layers.Dense(75, activation=tf.nn.relu6))
model.add(tf.keras.layers.Dropout(rate=.15))
model.add(tf.keras.layers.Dense(30, activation=tf.nn.relu6))
model.add(tf.keras.layers.Dense(15, activation=tf.nn.relu6))
model.add(tf.keras.layers.Dense(2, activation=tf.nn.softmax, name="output_layer"))


# In[ ]:


model.build( x_train.shape )
model.summary()


# In[ ]:


from keras.optimizers import Adam
log_dir = "logs/fit/" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
tensorboard_callback = tf.keras.callbacks.TensorBoard(log_dir=log_dir, histogram_freq=1)
model.compile(Adam(learning_rate=0.0005), loss='sparse_categorical_crossentropy', metrics=['accuracy'])


# In[ ]:


model.fit(x_train, y_train, epochs=60, validation_split=0.30, batch_size=3_000, verbose=2, shuffle=True, use_multiprocessing=True, callbacks=[tensorboard_callback])


# In[ ]:


todayPredictions = model.predict([x_test])


# In[ ]:


model = tf.keras.models.load_model("./trained_models/v2")


# In[ ]:


import os
import numpy as np
model_dir = "../API/src/data"
for file in os.listdir(model_dir):
    if not file.endswith(".csv") or not file.__contains__("2022"):
        continue

    teamStats = pd.read_csv(f"{model_dir}/{file}")
    filteredTeamStats = teamStats.drop(["TEAM_NAME", "TEAM_ID","GP","GP_RANK","CFID", "MIN", "CFPARAMS", "MIN_RANK", "MIN_RANK.1"], axis = 1)
    filteredTeamStats = filteredTeamStats.drop(["W","L","PLUS_MINUS","W_RANK", "L_RANK", "PLUS_MINUS_RANK",], axis = 1)
    filteredTeamStats = filteredTeamStats.drop(["TEAM_NAME.1", "TEAM_ID.1","GP.1","GP_RANK.1","CFID.1", "MIN.1", "CFPARAMS.1",], axis = 1)
    filteredTeamStats = filteredTeamStats.drop(["W.1","L.1","PLUS_MINUS.1","W_RANK.1", "L_RANK.1", "PLUS_MINUS_RANK.1",], axis = 1)
    todayPredictions = model.predict(filteredTeamStats)

    print(f"{file}")
    for i in range (0,len(todayPredictions)):
        away_team_perc = todayPredictions[i][0]
        home_team_perc = todayPredictions[i][1]
        print(f"{teamStats['TEAM_NAME'][i]} {home_team_perc} vs {teamStats['TEAM_NAME.1'][i]} {away_team_perc}")
        if np.argmax(todayPredictions[i]) == 1:
            print(f"{teamStats['TEAM_NAME'][i]} win")
        else:
            print(f"{teamStats['TEAM_NAME.1'][i]} win ")
        print()
        print()


# # Save the Model

# In[ ]:


import datetime
model.save(f"model_{datetime.datetime.utcnow()}")

