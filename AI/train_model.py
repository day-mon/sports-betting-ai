#!/usr/bin/env python
# coding: utf-8

# # Import Dependancies

# In[1]:


import tensorflow as tf
import pandas as pd
import numpy as np
import keras

# In[4]:


print("Num GPUs Available: ", len(tf.config.list_physical_devices('GPU')))
print("Num TPUs Available: ", len(tf.config.list_physical_devices('TPU')))

# # Read in the Data

# In[5]:


rawData = pd.read_excel("Full-Data-Set-UnderOver-2020-21.xlsx")

# In[6]:


rawData.describe()

# ## Filter the data / Remove older seasons

# ## Clean the Data

# In[7]:


filteredData = rawData.drop(["Unnamed: 0"], axis=1)
filteredData = filteredData.drop(["Score"], axis=1)
filteredData = filteredData.drop(["GP"], axis=1)
filteredData = filteredData.drop(["GP.1"], axis=1)
filteredData = filteredData.drop(["Home-Team-Win"], axis=1)
filteredData = filteredData.drop(["TEAM_NAME"], axis=1)
filteredData = filteredData.drop(["Date"], axis=1)
filteredData = filteredData.drop(["MIN"], axis=1)
filteredData = filteredData.drop(["MIN.1"], axis=1)
filteredData = filteredData.drop(["TEAM_NAME.1"], axis=1)
filteredData = filteredData.drop(["Date.1"], axis=1)
filteredData = filteredData.drop(["OU"], axis=1)
filteredData = filteredData.drop(["OU-Cover"], axis=1)
filteredData = filteredData.drop(["GP_RANK"], axis=1)
filteredData = filteredData.drop(["GP_RANK.1"], axis=1)

# In[8]:


filteredData = filteredData.astype(float)

# In[9]:


filteredData.head()

# # Train the Model

# #### Get the outputs

# In[10]:


output = rawData['Home-Team-Win']

# In[11]:


x_train = filteredData
y_train = output

# In[12]:


model = keras.Sequential()

# In[13]:


model.add(tf.keras.layers.Flatten())
model.add(tf.keras.layers.Dense(2048, activation='relu'))
model.add(tf.keras.layers.Dense(1024, activation='relu'))
model.add(tf.keras.layers.Dense(512, activation='relu'))
model.add(tf.keras.layers.Dense(256, activation='relu'))
model.add(tf.keras.layers.Dense(512, activation='relu'))
model.add(tf.keras.layers.Dense(1024, activation='relu'))
model.add(tf.keras.layers.Dense(2, activation='softmax'))

# In[14]:


model.build(x_train.shape)
model.summary()

# In[15]:


model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# In[16]:


model.fit(x_train, y_train, epochs=1000)

# In[24]:


predictions = model.predict([x_train])

#
# In[22]:
model.save('model')
